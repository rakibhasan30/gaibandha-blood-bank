'use client';

const COLORS = [
  '#E8334A', '#C4253A', '#FF6B6B', '#FF8E53', '#FFC947',
  '#06D6A0', '#118AB2', '#073B4C', '#7B2D8B', '#FF4081',
];

function getColor(name) {
  if (!name) return COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ name, size = 48, photoUrl }) {
  const bg = getColor(name);
  const initials = getInitials(name);

  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: size * 0.38,
    border: '2px solid #fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    flexShrink: 0,
    overflow: 'hidden',
  };

  if (photoUrl) {
    return (
      <div style={style}>
        <img src={photoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }

  return <div style={style}>{initials}</div>;
}
