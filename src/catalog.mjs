export const site = {
  name: "reav.website",
  url: "https://reav.website",
  description: "Catalogo di gestionali web per il lavoro operativo. Scopri DoganaTools per i controlli portuali e LogiFlow per fascicoli e uscite container."
};

export const catalog = [
  {
    slug: "logistica",
    name: "Logistica",
    title: "Gestionali per la logistica portuale",
    number: "01",
    description: "Gestionali per consultare container e approdi, organizzare i fascicoli e registrare le uscite dal porto.",
    products: [
      {
        slug: "doganatools",
        name: "DoganaTools",
        number: "01",
        icon: "container",
        color: "lime",
        label: "Monitoraggio portuale",
        access: "Controlla ingressi e chiusure doganali",
        subtitle: "Ricerca container e approdi",
        description: "Controlla gli ingressi dei container e consulta approdi e chiusure doganali di SCT, CONATECO e TFG con DoganaTools.",
        summary: "Consulta gli ingressi dei container e le chiusure doganali delle navi da un unico spazio di lavoro.",
        intro: "Per chi segue l’operatività portuale e deve verificare se un container è entrato, consultare una nave o tenere sotto controllo le chiusure doganali.",
        url: "https://dogana.reav.website/",
        features: [
          { title: "Ricerca contenitori", text: "Organizza le ricerche in liste per terminal, controlla lo stato dei container e scarica i report disponibili." },
          { title: "Elenco approdi", text: "Cerca navi e viaggi e consulta le informazioni di chiusura doganale per SCT, CONATECO e TFG." },
          { title: "Spazio di lavoro aziendale", text: "Configura i terminal che ti servono e condividi le liste di ricerca con gli operatori della tua azienda." }
        ],
        note: "La ricerca contenitori su SCT richiede un account SCT abilitato. Le informazioni disponibili dipendono dal terminal consultato."
      },
      {
        slug: "logiflow",
        name: "LogiFlow",
        number: "02",
        icon: "folder",
        color: "blue",
        label: "Documenti e uscite",
        access: "Trova i documenti e registra le uscite",
        subtitle: "Fascicoli portuali e uscite container",
        description: "Organizza fascicoli portuali, PDF, cassette e bolle. Con LogiFlow i trasportatori consultano il ritiro e registrano le uscite dei container.",
        summary: "Collega documenti, cassette e uscite dei container, dalla preparazione del fascicolo al ritiro in porto.",
        intro: "Per chi prepara i fascicoli portuali e per chi deve trovare i documenti in cassetta o registrare l’uscita effettiva di un container.",
        url: "https://logiflow.reav.website/",
        features: [
          { title: "Fascicoli e PDF", text: "Carica i documenti, verifica i codici contenitore proposti e associa ogni operazione al cliente e alla cassetta." },
          { title: "Ricerca per il ritiro", text: "Il trasportatore cerca il codice del container e consulta lo stato e la posizione dei documenti dopo la conferma del deposito." },
          { title: "Registro uscite", text: "Registra l’uscita effettiva e segui l’avanzamento delle bolle con più contenitori." }
        ],
        note: "La ricerca per contenitore è pubblica. La gestione delle operazioni, dei clienti e dei PDF è riservata all’area operatore."
      }
    ]
  }
];
