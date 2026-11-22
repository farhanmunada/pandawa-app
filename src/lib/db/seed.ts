import { db } from './index';
import { roles, periods, userRoles, members, user, account, wallets, assets } from './schema';
import { eq } from 'drizzle-orm';
import { initialRoles, demoAccounts, defaultWallets, initialAssets } from './seed-data';

export async function seedInitialData() {
  console.log('Seeding initial organizational roles...');

  for (const roleData of initialRoles) {
    await db
      .insert(roles)
      .values(roleData)
      .onConflictDoNothing({ target: roles.key });
  }

  // Inisialisasi Periode Kepengurusan Awal
  await db
    .insert(periods)
    .values({
      name: 'Periode 2026–2028',
      startYear: 2026,
      endYear: 2028,
      isActive: true,
    })
    .onConflictDoNothing();

  const activePeriod = await db.query.periods.findFirst({
    where: eq(periods.isActive, true),
  });

  if (!activePeriod) return;

  console.log('Seeding demo accounts for each division...');

  for (const acc of demoAccounts) {
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, acc.email),
    });

    let userId = existingUser?.id;

    if (!userId) {
      userId = `usr_demo_${acc.memberNumber}`;
      await db.insert(user).values({
        id: userId,
        name: acc.name,
        email: acc.email,
        phone: acc.phone,
        emailVerified: true,
        isActive: true,
      });

      await db.insert(account).values({
        id: `acc_demo_${acc.memberNumber}`,
        accountId: userId,
        providerId: 'credential',
        userId,
        password: acc.password,
      });
    }

    if (userId) {
      await db
        .update(user)
        .set({ phone: acc.phone, name: acc.name })
        .where(eq(user.id, userId));

      const existingAccount = await db.query.account.findFirst({
        where: eq(account.userId, userId),
      });

      if (existingAccount) {
        await db
          .update(account)
          .set({ password: acc.password })
          .where(eq(account.id, existingAccount.id));
      } else {
        await db.insert(account).values({
          id: `acc_demo_${acc.memberNumber}`,
          accountId: userId,
          providerId: 'credential',
          userId,
          password: acc.password,
        });
      }

      const roleRecord = await db.query.roles.findFirst({
        where: eq(roles.key, acc.roleKey),
      });

      if (roleRecord) {
        await db
          .insert(userRoles)
          .values({
            userId,
            roleId: roleRecord.id,
            periodId: activePeriod.id,
          })
          .onConflictDoNothing();
      }

      const existingMember = await db.query.members.findFirst({
        where: eq(members.userId, userId),
      });

      if (!existingMember) {
        await db.insert(members).values({
          userId,
          periodId: activePeriod.id,
          memberNumber: acc.memberNumber,
          positionTitle: acc.positionTitle,
          division: acc.division,
          status: 'active',
        });
      } else {
        await db
          .update(members)
          .set({
            memberNumber: acc.memberNumber,
            positionTitle: acc.positionTitle,
            division: acc.division,
            status: 'active',
          })
          .where(eq(members.id, existingMember.id));
      }
    }
  }

  console.log('Seeding default organizational wallets...');
  for (const w of defaultWallets) {
    const existing = await db.query.wallets.findFirst({
      where: eq(wallets.name, w.name),
    });
    if (!existing) {
      await db.insert(wallets).values(w);
    }
  }

  console.log('Seeding initial inventory assets...');
  for (const a of initialAssets) {
    const existing = await db.query.assets.findFirst({
      where: eq(assets.code, a.code),
    });
    if (!existing) {
      await db.insert(assets).values(a);
    }
  }

  console.log('Seeding demo accounts completed successfully.');
}
