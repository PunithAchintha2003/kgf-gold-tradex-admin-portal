export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatDate(value?: string): string {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(value?: string): string {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function roleLabel(role?: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super Admin';
    case 'MERCHANT':
      return 'Merchant';
    case 'USER':
      return 'User';
    default:
      return role ?? 'Account';
  }
}

export function profileCompletionScore(fields: {
  name: string;
  phone: string;
  address: string;
  email: string;
}): number {
  const values = [fields.name.trim(), fields.phone.trim(), fields.address.trim(), fields.email.trim()];
  const filled = values.filter(Boolean).length;
  return Math.round((filled / values.length) * 100);
}
