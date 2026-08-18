export type Group = { id: string; name: string; description: string; image: string };
export type Certificate = { id: string; title: string; category: string; groupId: string; description: string; image: string; pdf: string };

export const groups: Group[] = [
  { id: "eiffel", name: "Eiffel", description: "Percurso escolar atual no Liceu nº 1002 BGO Eiffel–Dande.", image: "./assets/liceu-eiffel-dande.png" },
  { id: "uniathena", name: "UniAthena", description: "Transcripts de aprendizagem e realização académica.", image: "./assets/uniathena.png" },
  { id: "cambridge", name: "UniAthena + Cambridge International Qualifications", description: "Certificados desenvolvidos e entregues em parceria com a Cambridge International Qualifications, UK.", image: "./assets/ciq.jpg" },
  { id: "efset", name: "EF SET", description: "Certificação internacional de inglês — nível B1 Intermediate.", image: "./assets/ef-set.png" },
];

export const certificates: Certificate[] = [
  ["CR1561", "Basics of Oil & Gas - Economics (CR1561)", "Transcript", "uniathena", "Record of Learning and Achievement — UniAthena.", "./assets/uniathena.png", "./assets/CR1561.pdf"],
  ["CR1562", "Basics of Oil & Gas - Reserves, Risk & Value (CR1562)", "Transcript", "uniathena", "Record of Learning and Achievement — UniAthena.", "./assets/uniathena.png", "./assets/CR1562.pdf"],
  ["CR1573", "Basics of Oil & Gas - Finance & Accounting (CR1573)", "Transcript", "uniathena", "Record of Learning and Achievement — UniAthena.", "./assets/uniathena.png", "./assets/CR1573.pdf"],
  ["CR1574", "Basics of Oil & Gas - Strategy, Sustainability & Digital Foundations (CR1574)", "Transcript", "uniathena", "Record of Learning and Achievement — UniAthena.", "./assets/uniathena.png", "./assets/CR1574.pdf"],
  ["ciq-econ", "Basics of Oil & Gas - Economics", "Certificate", "cambridge", "Certificate developed and delivered by UniAthena in partnership with Cambridge International Qualifications, UK.", "./assets/ciq.jpg", "./assets/certificate-economics.pdf"],
  ["ciq-copy", "Basics of Oil & Gas - Economics (duplicate certificate file)", "Certificate", "cambridge", "Second supplied PDF copy of the Economics certificate.", "./assets/ciq.jpg", "./assets/certificate-economics-copy.pdf"],
  ["ciq-finance", "Basics of Oil & Gas - Finance & Accounting", "Certificate", "cambridge", "Certificate developed and delivered by UniAthena in partnership with Cambridge International Qualifications, UK.", "./assets/ciq.jpg", "./assets/certificate-finance.pdf"],
  ["ciq-strategy", "Basics of Oil & Gas - Strategy, Sustainability & Digital Foundations", "Certificate", "cambridge", "Certificate developed and delivered by UniAthena in partnership with Cambridge International Qualifications, UK.", "./assets/ciq.jpg", "./assets/certificate-strategy.pdf"],
  ["efset", "EF SET Certificate — B1 Intermediate (42/100)", "English Certificate", "efset", "EF SET English certificate awarded on 27 July 2026.", "./assets/ef-set.png", "./assets/EFSETCertificate.pdf"],
].map(([id, title, category, groupId, description, image, pdf]) => ({ id, title, category, groupId, description, image, pdf } as Certificate));
