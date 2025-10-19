// Available Sections Configuration
const availableSections = {

    testimonials: {

        icon: "star",

        t: {

            en: { title: "Testimonials", prompt: "Create a 'Testimonials' section (id='testimonials') with 3 fictitious but believable recommendations, including the recommender's name." },

            he: { title: "לקוחות ממליצים", prompt: "צור מקטע 'לקוחות ממליצים' (id='testimonials') עם 3 המלצות פיקטיביות אך אמינות, כולל שם הממליץ." },

            ar: { title: "شهادات العملاء", prompt: "أنشئ قسم 'شهادات العملاء' (id='testimonials') مع 3 توصيات وهمية ولكن معقولة، بما في ذلك اسم الموصي." },

            es: { title: "Testimonios", prompt: "Crea una sección de 'Testimonios' (id='testimonials') con 3 recomendaciones ficticias pero creíbles, incluyendo el nombre de quien recomienda." },

            fr: { title: "Témoignages", prompt: "Créez une section 'Témoignages' (id='testimonials') avec 3 recommandations fictives mais crédibles, incluant le nom de la personne qui recommande." }

        }

    },

    faq: {

        icon: "help-circle",

         t: {

            en: { title: "FAQ", prompt: "Create an 'FAQ' section (id='faq') with 4 relevant common questions and short answers." },

            he: { title: "שאלות ותשובות", prompt: "צור מקטע 'שאלות ותשובות' (id='faq') עם 4 שאלות נפוצות רלוונטיות ותשובות קצרות." },

            ar: { title: "الأسئلة الشائعة", prompt: "أنشئ قسم 'الأسئلة الشائعة' (id='faq') مع 4 أسئلة شائعة ذات صلة وإجابات قصيرة." },

            es: { title: "Preguntas Frecuentes", prompt: "Crea una sección de 'Preguntas Frecuentes' (id='faq') con 4 preguntas comunes relevantes y respuestas cortas." },

            fr: { title: "FAQ", prompt: "Créez une section 'FAQ' (id='faq') avec 4 questions fréquentes pertinentes et des réponses courtes." }

        }

    },

    team: {

        icon: "users",

        t: {

            en: { title: "Our Team", prompt: "Create an 'Our Team' section (id='team') with 3 fictitious team members, including a picture, name, and role." },

            he: { title: "הצוות שלנו", prompt: "צור מקטע 'הצוות שלנו' (id='team') עם 3 חברי צוות פיקטיביים, כולל תמונה, שם ותפקיד." },

            ar: { title: "فريقنا", prompt: "أنشئ قسم 'فريقنا' (id='team') مع 3 أعضاء فريق وهميين، بما في ذلك صورة واسم ودور." },

            es: { title: "Nuestro Equipo", prompt: "Crea una sección de 'Nuestro Equipo' (id='team') con 3 miembros de equipo ficticios, incluyendo una foto, nombre y cargo." },

            fr: { title: "Notre Équipe", prompt: "Créez une section 'Notre Équipe' (id='team') avec 3 membres d'équipe fictifs, incluant une photo, un nom et un rôle." }

        }

    },

    gallery: {

        icon: "image",

         t: {

            en: { title: "Image Gallery", prompt: "Create an image gallery section (id='gallery') with 6 placeholder images from placehold.co." },

            he: { title: "גלריית תמונות", prompt: "צור מקטע גלריית תמונות (id='gallery') עם 6 תמונות placeholder מ-placehold.co." },

            ar: { title: "معرض الصور", prompt: "أنشئ قسم معرض الصور (id='gallery') مع 6 صور مؤقتة من placehold.co." },

            es: { title: "Galería de Imágenes", prompt: "Crea una sección de galería de imágenes (id='gallery') con 6 imágenes de marcador de posición de placehold.co." },

            fr: { title: "Galerie d'Images", prompt: "Créez une section de galerie d'images (id='gallery') avec 6 images de substitution de placehold.co." }

        }

    },

    pricingTable: {

        icon: "dollar-sign",

        t: {

            en: { title: "Pricing Table", prompt: "Create a 'Pricing Table' section (id='pricing') with 3 different packages (e.g., Basic, Popular, Premium), including a list of features and a price for each." },

            he: { title: "טבלת מחירים", prompt: "צור מקטע 'טבלת מחירים' (id='pricing') עם 3 חבילות שונות (לדוגמה: בסיסית, פופולרית, פרימיום), כולל רשימת תכונות ומחיר לכל אחת." },

            ar: { title: "جدول الأسعار", prompt: "أنشئ قسم 'جدول الأسعار' (id='pricing') مع 3 حزم مختلفة (مثل: أساسية، شائعة، مميزة)، بما في ذلك قائمة بالميزات وسعر لكل منها." },

            es: { title: "Tabla de Precios", prompt: "Crea una sección de 'Tabla de Precios' (id='pricing') con 3 paquetes diferentes (por ejemplo, Básico, Popular, Premium), incluyendo una lista de características y un precio para cada uno." },

            fr: { title: "Tableau des Prix", prompt: "Créez une section 'Tableau des Prix' (id='pricing') avec 3 forfaits différents (par exemple, Basique, Populaire, Premium), incluant une liste de fonctionnalités et un prix pour chacun." }

        }

    },

    callToAction: {

        icon: "megaphone",

        t: {

            en: { title: "Call to Action", prompt: "Create a visually prominent 'Call to Action' section (id='cta') with a different background color, a compelling headline, and a large, clear button." },

            he: { title: "קריאה לפעולה", prompt: "צור מקטע קריאה לפעולה (id='cta') ויזואלי ובולט, עם רקע בצבע שונה, כותרת משכנעת וכפתור גדול וברור." },

            ar: { title: "دعوة للعمل", prompt: "أنشئ قسم 'دعوة للعمل' (id='cta') بارز بصريًا بخلفية بلون مختلف وعنوان مقنع وزر كبير وواضح." },

            es: { title: "Llamada a la Acción", prompt: "Crea una sección de 'Llamada a la Acción' (id='cta') visualmente destacada con un color de fondo diferente, un titular convincente y un botón grande y claro." },

            fr: { title: "Appel à l'Action", prompt: "Créez une section 'Appel à l'Action' (id='cta') visuellement proéminente avec une couleur de fond différente, un titre convaincant et un bouton grand et clair." }

        }

    }

};

// Export for use in main HTML file
if (typeof module !== 'undefined' && module.exports) {
    module.exports = availableSections;
}

