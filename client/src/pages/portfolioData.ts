export type Group = { id: string; name: string; description: string; image: string };
export type Certificate = { id: string; title: string; category: string; groupId: string; groupIds?: string[]; description: string; image: string; pdf: string };

export const groups: Group[] = [
  { id: "eiffel", name: "Eiffel", description: "Percurso escolar atual no Liceu nº 1002 BGO Eiffel–Dande.", image: "/assets/liceu-eiffel-dande.png" },
  { id: "uniathena", name: "UniAthena", description: "Transcripts de aprendizagem e realização académica.", image: "/assets/uniathena.png" },
  { id: "cambridge", name: "Cambridge International Qualifications", description: "Certificados internacionais da Cambridge International Qualifications, UK.", image: "/assets/ciq.jpg" },
  { id: "efset", name: "EF SET", description: "Certificação internacional de inglês — nível B1 Intermediate.", image: "/assets/ef-set.png" },
  { id: "saylor", name: "Saylor.org Academy", description: "Formação online e certificados académicos da Saylor.org Academy.", image: "/assets/saylor-academy.jpg" },
  { id: "fede", name: "FEDE", description: "Federação Europeia de Escolas — instituição associada ao percurso UniAthena.", image: "/assets/fede.png" },
];

export const certificates: Certificate[] = [
  ["ciq-econ", "Basics of Oil & Gas - Economics", "Certificate", "cambridge", "Certificate developed and delivered by UniAthena in partnership with Cambridge International Qualifications, UK.", "/assets/ciq.jpg", "/assets/certificate-economics.pdf"],
  ["ciq-finance", "Basics of Oil & Gas - Finance & Accounting", "Certificate", "cambridge", "Certificate developed and delivered by UniAthena in partnership with Cambridge International Qualifications, UK.", "/assets/ciq.jpg", "/assets/certificate-finance.pdf"],
  ["ciq-strategy", "Basics of Oil & Gas - Strategy, Sustainability & Digital Foundations", "Certificate", "cambridge", "Certificate developed and delivered by UniAthena in partnership with Cambridge International Qualifications, UK.", "/assets/ciq.jpg", "/assets/certificate-strategy.pdf"],
].map(([id, title, category, groupId, description, image, pdf]) => ({ id, title, category, groupId, groupIds: groupId === "cambridge" ? ["uniathena", "cambridge", "fede"] : [groupId], description, image, pdf } as Certificate));
