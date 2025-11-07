import { useTheme } from '../../shared/hooks/useTheme';

interface LogoProps {
  className?: string;
  inline?: boolean;
}

export function Logo({ className, inline = false }: LogoProps) {
  const { theme } = useTheme();
  
  let logoSrc: string;
  if (inline) {
    // Para logo inline, usar logoinlinewhite.jpg no lightmode e logoinline.png no darkmode
    logoSrc = theme === 'light' ? '/logoinlinewhite.png' : '/logoinline.png';
  } else {
    logoSrc = '/logo.png';
  }
  
  return (
    <img
      src={logoSrc}
      alt="Imperium"
      className={className}
    />
  );
}
