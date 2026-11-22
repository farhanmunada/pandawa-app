import { google } from 'googleapis';
import { Readable } from 'stream';

export function getGoogleDriveClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

export async function uploadToDrive(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  subfolderName?: string
): Promise<{ fileId: string; webViewLink: string } | null> {
  const drive = getGoogleDriveClient();
  if (!drive) {
    console.warn('Google Drive credentials not set. Simulating storage.');
    return {
      fileId: `mock_drive_${Date.now()}`,
      webViewLink: `/mock-files/${fileName}`,
    };
  }

  try {
    const rawRoot = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID?.trim();
    const rootFolderId = rawRoot ? rawRoot.split('?')[0].replace(/\/+$/, '') : undefined;
    let targetFolderId = rootFolderId;

    if (rootFolderId && subfolderName) {
      // Pastikan subfolder ada
      const folderRes = await drive.files.list({
        q: `'${rootFolderId}' in parents and name = '${subfolderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id, name)',
      });

      if (folderRes.data.files && folderRes.data.files.length > 0) {
        targetFolderId = folderRes.data.files[0].id || rootFolderId;
      } else {
        // Buat subfolder
        const newFolder = await drive.files.create({
          requestBody: {
            name: subfolderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [rootFolderId],
          },
          fields: 'id',
        });
        targetFolderId = newFolder.data.id || rootFolderId;
      }
    }

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const fileRes = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: targetFolderId ? [targetFolderId] : undefined,
      },
      media: {
        mimeType,
        body: stream,
      },
      fields: 'id, webViewLink',
    });

    return {
      fileId: fileRes.data.id || '',
      webViewLink: fileRes.data.webViewLink || '',
    };
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    return null;
  }
}
