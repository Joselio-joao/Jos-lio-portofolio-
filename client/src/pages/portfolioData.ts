export type Group = { id: string; name: string; description: string; image: string };
export type Certificate = { id: string; title: string; category: string; groupId: string; description: string; image: string; pdf: string };

export const groups: Group[] = [
  { id: "eiffel", name: "Eiffel", description: "Percurso escolar atual no Liceu nº 1002 BGO Eiffel–Dande.", image: "/Jos-lio-portofolio-/assets/liceu-eiffel-dande.png" },
  { id: "uniathena", name: "UniAthena", description: "Transcripts de aprendizagem e realização académica.", image: "/Jos-lio-portofolio-/assets/uniathena.png" },
  { id: "cambridge", name: "UniAthena + Cambridge International Qualifications", description: "Certificados desenvolvidos e entregues em parceria com a Cambridge International Qualifications, UK.", image: "/Jos-lio-portofolio-/assets/ciq.jpg" },
  { id: "efset", name: "EF SET", description: "Certificação internacional de inglês — nível B1 Intermediate.", image: "/Jos-lio-portofolio-/assets/ef-set.png" },
];

export const certificates: Certificate[] = [
  ["CR1561", "Basics of Oil & Gas - Economics (CR1561)", "Transcript", "uniathena", "Record of Learning and Achievement — UniAthena.", "/Jos-lio-portofolio-/assets/uniathena.png", "/Jos-lio-portofolio-/assets/CR1561.pdf"],
  ["CR1562", "Basics of Oil & Gas - Reserves, Risk & Value (CR1562)", "Transcript", "uniathena", "Record of Learning and Achievement — UniAthena.", "/Jos-lio-portofolio-/assets/uniathena.png", "/Jos-lio-portofolio-/assets/CR1562.pdf"],
  ["CR1573", "Basics of Oil & Gas - Finance & Accounting (CR1573)", "Transcript", "uniathena", "Record of Learning and Achievement — UniAthena.", "/Jos-lio-portofolio-/assets/uniathena.png", "/Jos-lio-portofolio-/assets/CR1573.pdf"],
  ["CR1574", "Basics of Oil & Gas - Strategy, Sustainability & Digital Foundations (CR1574)", "Transcript", "uniathena", "Record of Learning and Achievement — UniAthena.", "/Jos-lio-portofolio-/assets/uniathena.png", "/Jos-lio-portofolio-/assets/CR1574.pdf"],
  ["ciq-econ", "Basics of Oil & Gas - Economics", "Certificate", "cambridge", "Certificate developed and delivered by UniAthena in partnership with Cambridge International Qualifications, UK.", "/Jos-lio-portofolio-/assets/ciq.jpg", "/Jos-lio-portofolio-/assets/certificate-economics.pdf"],
  ["ciq-finance", "Basics of Oil & Gas - Finance & Accounting", "Certificate", "cambridge", "Certificate developed and delivered by UniAthena in partnership with Cambridge International Qualifications, UK.", "/Jos-lio-portofolio-/assets/ciq.jpg", "/Jos-lio-portofolio-/assets/certificate-finance.pdf"],
  ["ciq-strategy", "Basics of Oil & Gas - Strategy, Sustainability & Digital Foundations", "Certificate", "cambridge", "Certificate developed and delivered by UniAthena in partnership with Cambridge International Qualifications, UK.", "/Jos-lio-portofolio-/assets/ciq.jpg", "/Jos-lio-portofolio-/assets/certificate-strategy.pdf"],
].map(([id, title, category, groupId, description, image, pdf]) => ({ id, title, category, groupId, description, image, pdf } as Certificate));
