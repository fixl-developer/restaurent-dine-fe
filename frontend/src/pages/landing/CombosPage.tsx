import type { CustomCombo } from '../../types';
import type { RestaurantDto } from '../../lib/dto/restaurant';
import LandingHeader from '../../components/landing/LandingHeader';
import LandingFooter from '../../components/landing/LandingFooter';
import ComboConstructor from '../../components/ComboConstructor';

interface CombosPageProps {
  cartCount: number;
  onOpenCart: () => void;
  onAddCustomCombo: (combo: CustomCombo, price: number) => void;
  restaurant?: RestaurantDto;
}

export default function CombosPage({ cartCount, onOpenCart, onAddCustomCombo, restaurant }: CombosPageProps) {
  const brandName = restaurant?.brand.name ?? 'SmartDine';

  return (
    <div className="w-full font-sans">
      <LandingHeader brandName={brandName} cartCount={cartCount} onOpenCart={onOpenCart} />
      <ComboConstructor onAddCustomCombo={onAddCustomCombo} />
      <LandingFooter restaurant={restaurant} />
    </div>
  );
}
