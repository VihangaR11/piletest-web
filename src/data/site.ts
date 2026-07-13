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
  { label: 'About', href: 'about.html', children: [
    { label: 'Vision & Quality', href: 'about.html#vision-quality' },
    { label: 'Our Team', href: 'about.html#our-team' },
    { label: 'Achievements', href: 'achievements.html' },
    { label: 'Brochure', href: 'brochure.html' }
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
  { label: 'Gallery', href: 'photo.html', children: [
    { label: 'Photo Gallery', href: 'photo.html' },
    { label: 'Video Gallery', href: 'video.html' }
  ] },
  { label: 'Technical', href: 'technical.html', children: [
    { label: 'Equipment & Systems', href: 'technical.html#equipment' },
    { label: 'Analysis Software', href: 'technical.html#software' },
    { label: 'Request Technical Documents', href: 'technical.html#technical-library' },
    { label: 'Method References', href: 'technical.html#methods' }
  ] },
  { label: 'R & D', href: 'research.html' }
];
