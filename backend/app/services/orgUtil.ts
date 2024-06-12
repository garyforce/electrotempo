import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const isOrganizationElectroTempo = async (organizationId: number) => {
    // For Localhost there is no et_auth table, so just returning true
    if (process.env.DB_HOST === 'localhost') return true;

    const ELECTROTEMPO_ORGANIZATION_NAME = 'ElectroTempo';

    const organization: { id: number }[] | null | undefined =
        await prisma.$queryRaw`
    SELECT
      id
    FROM "et_auth"."organization"
    WHERE name = ${ELECTROTEMPO_ORGANIZATION_NAME}
    `;
    return organization?.[0].id === organizationId;
}
