import { useMentorados } from '../../shared/hooks/useMentorados';
import { useAuth } from '../../shared/hooks/useAuth';
import { Select } from './Select';

interface MentoradoSelectorProps {
  selectedMentoradoId: string | null;
  onSelectMentorado: (mentoradoId: string | null) => void;
}

export function MentoradoSelector({
  selectedMentoradoId,
  onSelectMentorado
}: MentoradoSelectorProps) {
  const { user } = useAuth();
  const { mentorados, isLoading } = useMentorados();

  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) {
    return null;
  }

  const options = [
    { value: 'me', label: 'Meus dados' },
    ...mentorados.map((mentorado) => ({
      value: mentorado.id,
      label: mentorado.name
    }))
  ];

  if (isLoading) {
    return null;
  }

  return (
    <div className="w-full md:w-auto">
      <Select
        className="min-w-[220px] md:min-w-[260px]"
        placeholder="Selecione um mentorado"
        options={options}
        value={selectedMentoradoId || 'me'}
        onChange={(value) => onSelectMentorado(value === 'me' ? null : value || null)}
      />
    </div>
  );
}

