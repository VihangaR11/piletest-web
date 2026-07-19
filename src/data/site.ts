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
  children?: readonly {
    label: string;
    href: string;
    children?: readonly { label: string; href: string }[];
  }[];
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
    { label: 'Pile Testing Services', href: 'services.html#pile-testing-services', children: [
      { label: 'Dynamic Load Testing (PDA)', href: 'services.html#pda' },
      { label: 'Static Load Testing (SLT)', href: 'services.html#slt' },
      { label: 'Instrumented Load Testing', href: 'services.html#imlt' },
      { label: 'Bi-Directional Load Testing', href: 'services.html#bdslt' },
      { label: 'Pile Integrity Testing (PIT)', href: 'services.html#pit' },
      { label: 'Cross-Hole Sonic Logging', href: 'services.html#csl' },
      { label: 'Lateral & Uplift Testing', href: 'services.html#lateral-load-testing' }
    ] },
    { label: 'Geotechnical Investigation', href: 'services.html#geotechnical-investigation', children: [
      { label: 'Borehole & Soil Investigation', href: 'services.html#borehole-investigation' },
      { label: 'Geophysical Surveys', href: 'services.html#geophysical-surveys' },
      { label: 'DCPT & Mackintosh Probe', href: 'services.html#dcpt' },
      { label: 'Soil Resistivity Survey', href: 'services.html#soil-resistivity' }
    ] },
    { label: 'Non-Destructive Testing', href: 'services.html#ndt-services', children: [
      { label: 'Rebound Hammer & UPV', href: 'services.html#rebound-hammer' },
      { label: 'Weld Inspections', href: 'services.html#ultrasonic-welds' },
      { label: 'Rebar Cover Survey', href: 'services.html#rebar-cover' }
    ] },
    { label: 'Monitoring & Instrumentation', href: 'services.html#monitoring-instrumentation', children: [
      { label: 'Inclinometer & Piezometer', href: 'services.html#inclinometer' },
      { label: 'Vibration & Settlement', href: 'services.html#vibration-monitoring' },
      { label: 'Crack & Structural Health', href: 'services.html#crack-monitoring' },
      { label: 'Temperature & Strain Gauges', href: 'services.html#temperature-monitoring' }
    ] },
    { label: 'Laboratory Testing', href: 'services.html#laboratory-testing', children: [
      { label: 'Soil Laboratory Testing', href: 'services.html#soil-laboratory' },
      { label: 'Concrete & Material Testing', href: 'services.html#concrete-testing' },
      { label: 'CBR, Triaxial & Consolidation', href: 'services.html#cbr-testing' }
    ] },
    { label: 'Consultancy & Specialized Testing', href: 'services.html#consultancy-specialized', children: [
      { label: 'Foundation Design', href: 'services.html#foundation-design' },
      { label: 'Retaining & Ground Improvement', href: 'services.html#retaining-structures' },
      { label: 'Anchor & Solar Foundation Tests', href: 'services.html#anchor-pullout' },
      { label: 'Beam & Plate Load Testing', href: 'services.html#beam-load-testing' }
    ] }
  ] },
  { label: 'Projects', href: 'projects.html', children: [
    { label: 'Landmark Projects', href: 'projects.html#landmark-projects' },
    { label: 'High-Rise Buildings', href: 'projects.html#high-rise-projects' },
    { label: 'Infrastructure Projects', href: 'projects.html#infrastructure-projects' },
    { label: 'Industrial Projects', href: 'projects.html#industrial-projects' },
    { label: 'Renewable Energy Projects', href: 'projects.html#renewable-energy-projects' },
    { label: 'Ports & Marine Projects', href: 'projects.html#ports-marine-projects' },
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
