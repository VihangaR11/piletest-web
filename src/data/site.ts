export const site = {
  name: 'PileTeST Consultants (PVT) LTD',
  shortName: 'PileTeST',
  phone: '+94 70 3 600 600',
  phoneHref: 'tel:+94703600600',
  email: 'info@piletest.lk',
  address: '655A Halgahadeniya Road, Gothatuwa, Sri Lanka',
  registration: 'PV 106295',
  facebook: 'https://www.facebook.com/www.piletest.lk',
  linkedin: 'https://www.linkedin.com/company/pile-test-consultants-pvt-ltd/posts/?feedView=all'
} as const;

export interface NavItem {
  label: string;
  href: string;
  children?: readonly { label: string; href: string }[];
}

export const navigation: readonly NavItem[] = [
  { label: 'Home', href: 'index.html' },
  { label: 'About Us', href: 'about.html', children: [
    { label: 'Company Overview', href: 'about.html#company-overview' },
    { label: 'Vision & Mission', href: 'about.html#vision-mission' },
    { label: 'Our Journey', href: 'about.html#our-journey' },
    { label: 'Leadership Team', href: 'about.html#leadership-team' },
    { label: 'Technical Team', href: 'about.html#technical-team' },
    { label: 'External Consultants', href: 'about.html#external-consultants' },
    { label: 'Certifications', href: 'about.html#certifications' },
    { label: 'HSE & Quality Policy', href: 'about.html#hsq-policy' },
    { label: 'Corporate Information', href: 'about.html#corporate-information' }
  ] },
  { label: 'Services', href: 'services.html', children: [
    { label: 'Dynamic & Integrity Testing', href: 'services.html#foundation-integrity' },
    { label: 'Load Testing', href: 'services.html#load-testing' },
    { label: 'Monitoring & Ground Investigation', href: 'services.html#monitoring-investigation' },
    { label: 'Testing Experience', href: 'services.html#experience' },
    { label: 'Additional Services', href: 'services.html#additional-services' }
  ] },
  { label: 'Projects', href: 'projects.html', children: [
    { label: 'Overall Statistics', href: 'projects.html' },
    { label: 'Ongoing Projects', href: 'projects-ongoing.html' },
    { label: 'Completed Projects', href: 'projects-completed.html' }
  ] },
  { label: 'Equipment', href: 'technical.html#equipment', children: [
    { label: 'Equipment & Systems', href: 'technical.html#equipment' },
    { label: 'Analysis Software', href: 'technical.html#software' },
    { label: 'Testing Capacities', href: 'technical.html#equipment' }
  ] },
  { label: 'Resources', href: 'technical.html#technical-library', children: [
    { label: 'Request Technical Documents', href: 'technical.html#technical-library' },
    { label: 'Method References', href: 'technical.html#methods' },
    { label: 'Research & Development', href: 'research.html' },
    { label: 'Photo Gallery', href: 'photo.html' },
    { label: 'Video Gallery', href: 'video.html' }
  ] },
  { label: 'Contact Us', href: 'contact.html' }
];
