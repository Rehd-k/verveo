import PartnersNav from '@/components/partners/PartnersNav';
import PartnersHero from '@/components/partners/PartnersHero';
import PartnerBenefits from '@/components/partners/PartnerBenefits';
import HowPartnerWorks from '@/components/partners/HowPartnerWorks';
import PartnerRequirements from '@/components/partners/PartnerRequirements';
import PartnerFAQ from '@/components/partners/PartnerFAQ';
import PartnerCTA from '@/components/partners/PartnerCTA';
import PartnersFooter from '@/components/partners/PartnersFooter';

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PartnersNav />
      <PartnersHero />
      <PartnerBenefits />
      <HowPartnerWorks />
      <PartnerRequirements />
      <PartnerFAQ />
      <PartnerCTA />
      <PartnersFooter />
    </main>
  );
}
