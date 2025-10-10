// Page Templates Configuration
const pageTemplates = {

    landing: {

        img: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",

        fields: ['websiteLink'],

        structurePrompt: `Build a landing page with only the following sections, in this order: 1. A simple Header containing the provided external links ('Main Link', 'Additional External Link') as text links or small buttons on the side. 2. Hero Section (id="home") with a headline, description, and a central CTA button. 3. Benefits section (id="benefits") with 3 key benefits. 4. Contact form section (id="contact").`,

        t: {

            en: { title: "Landing Page", label: "Campaign Name", description: "A focused page for conversions and lead collection.", guidance: "<b>Landing Page</b> is a focused page designed to make a visitor perform a single action, like leaving details or making a purchase." },

            he: { title: "דף נחיתה", label: "שם הקמפיין", description: "דף ממוקד להמרות ואיסוף לידים.", guidance: "<b>דף נחיתה</b> הוא דף ממוקד שנועד לגרום למבקר לבצע פעולה אחת, כמו השארת פרטים או רכישה." },

            ar: { title: "صفحة هبوط", label: "اسم الحملة", description: "صفحة مركزة للتحويل وجمع العملاء المحتملين.", guidance: "<b>صفحة الهبوط</b> هي صفحة مركزة مصممة لجعل الزائر يقوم بعمل واحد، مثل ترك التفاصيل أو إجراء عملية شراء." },
            ja: { title: "ランディングページ", label: "キャンペーン名", description: "コンバージョンとリード収集に焦点を当てたページ。", guidance: "<b>ランディングページ</b>は、訪問者が詳細を残したり購入したりするなどの単一のアクションを実行するよう設計された集中ページです。" },
            es: { title: "Página de Aterrizaje", label: "Nombre de la Campaña", description: "Una página enfocada en conversiones y captación de leads.", guidance: "Una <b>Página de Aterrizaje</b> es una página enfocada diseñada para que un visitante realice una sola acción, como dejar sus datos o realizar una compra." },

            fr: { title: "Page d'Atterrissage", label: "Nom de la Campagne", description: "Une page ciblée pour les conversions et la collecte de prospects.", guidance: "Une <b>Page d'Atterrissage</b> est une page ciblée conçue pour inciter un visiteur à effectuer une seule action, comme laisser ses coordonnées ou faire un achat." },
            de: { title: "Landing Page", label: "Kampagnenname", description: "Eine fokussierte Seite für Konversionen und Lead-Sammlung.", guidance: "Eine <b>Landing Page</b> ist eine fokussierte Seite, die darauf ausgelegt ist, einen Besucher zu einer einzigen Aktion zu veranlassen, wie das Hinterlassen von Details oder einen Kauf." },
            ru: { title: "Целевая Страница", label: "Название Кампании", description: "Сфокусированная страница для конверсий и сбора лидов.", guidance: "<b>Целевая Страница</b> - это сфокусированная страница, предназначенная для того, чтобы посетитель выполнил одно действие, например, оставил данные или совершил покупку." },
            zh: { title: "着陆页", label: "活动名称", description: "专注于转化和潜在客户收集的页面。", guidance: "<b>着陆页</b>是一个专注的页面，旨在让访问者执行单一操作，如留下详细信息或进行购买。" }
        }

    },

    general: {

        img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop",

        fields: ['websiteLink'],

         structurePrompt: `Build a brand page with only the following sections, in this order: 1. Header with a logo and navigation. In the navigation, include internal links to relevant sections (About, Services, Contact) and also the provided external links ('Main Link', 'Additional External Link'). If button text is provided, use it. The external links should be prominent, perhaps as buttons. 2. Hero Section (id="home"). 3. About section (id="about"). 4. Services section (id="services"). 5. Contact section (id="contact"). 6. Footer.`,

        t: {

            en: { title: "Brand Page", label: "Business Name", description: "Showcase your business to the world.", guidance: "A <b>Brand Page</b> is like your expanded digital business card. Its purpose is to present your business, services, and story professionally." },

            he: { title: "דף תדמית", label: "שם העסק", description: "הצג את העסק שלך לעולם.", guidance: "<b>דף תדמית</b> הוא כמו כרטיס הביקור הדיגיטלי המורחב שלך. מטרתו להציג את העסק, השירותים והסיפור שלך בצורה מקצועית." },

            ar: { title: "صفحة العلامة التجارية", label: "اسم العمل", description: "اعرض عملك للعالم.", guidance: "<b>صفحة العلامة التجارية</b> مثل بطاقة العمل الرقمية الموسعة. هدفها هو تقديم عملك وخدماتك وقصتك بشكل مهني." },
            ja: { title: "ブランドページ", label: "ビジネス名", description: "あなたのビジネスを世界に紹介しましょう。", guidance: "<b>ブランドページ</b>は、拡張されたデジタル名刺のようなものです。その目的は、あなたのビジネス、サービス、ストーリーを専門的に提示することです。" },
             es: { title: "Página de Marca", label: "Nombre del Negocio", description: "Muestra tu negocio al mundo.", guidance: "Una <b>Página de Marca</b> es como tu tarjeta de visita digital ampliada. Su propósito es presentar tu negocio, servicios e historia de manera profesional." },

            fr: { title: "Page de Marque", label: "Nom de l'Entreprise", description: "Présentez votre entreprise au monde.", guidance: "Une <b>Page de Marque</b> est comme votre carte de visite numérique étendue. Son but est de présenter votre entreprise, vos services et votre histoire de manière professionnelle." },
            de: { title: "Markenseite", label: "Geschäftsname", description: "Präsentieren Sie Ihr Geschäft der Welt.", guidance: "Eine <b>Markenseite</b> ist wie Ihre erweiterte digitale Visitenkarte. Ihr Zweck ist es, Ihr Geschäft, Ihre Dienstleistungen und Ihre Geschichte professionell zu präsentieren." },
            ru: { title: "Страница Бренда", label: "Название Бизнеса", description: "Покажите свой бизнес миру.", guidance: "<b>Страница Бренда</b> - это как ваша расширенная цифровая визитная карточка. Её цель - профессионально представить ваш бизнес, услуги и историю." },
            zh: { title: "品牌页面", label: "企业名称", description: "向世界展示您的企业。", guidance: "<b>品牌页面</b>就像您扩展的数字名片。它的目的是专业地展示您的企业、服务和故事。" }
        }

    },

    post: {

        img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",

        fields: ['postLayout'],

        structurePrompt: {

            base: `...`, 

            layouts: {

               "Partial Cover": `...`,

               "Full Image Background": `...`,

               "Bold Poster": `...`,

            }

        },

        t: {

            en: { title: "Marketing Post", label: "Post Title", description: "A visual post for social media." },

            he: { title: "פוסט שיווקי", label: "כותרת הפוסט", description: "פוסט ויזואלי לרשתות חברתיות." },

            ar: { title: "منشور تسويقي", label: "عنوان المنشور", description: "منشور بصري لوسائل التواصل الاجتماعي." },
            ja: { title: "マーケティング投稿", label: "投稿タイトル", description: "ソーシャルメディア用のビジュアル投稿。" },
            es: { title: "Publicación de Marketing", label: "Título de la Publicación", description: "Una publicación visual para redes sociales." },

            fr: { title: "Publication Marketing", label: "Titre de la Publication", description: "Une publication visuelle pour les réseaux sociaux." },
            de: { title: "Marketing-Beitrag", label: "Beitragstitel", description: "Ein visueller Beitrag für soziale Medien." },
            ru: { title: "Маркетинговый Пост", label: "Заголовок Поста", description: "Визуальный пост для социальных сетей." },
            zh: { title: "营销帖子", label: "帖子标题", description: "用于社交媒体的视觉帖子。" }
        }

    },

    flyer: {

        img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1887&auto=format&fit=crop",

        fields: ['menuItems'],

        structurePrompt: `Build a menu page with the following sections only: 1. Header (id="header") with the business name. 2. Category sections (e.g., 'Appetizers', 'Main Courses') and under each category, a grid of items based on the provided data. 3. Contact details and address as plain text (not links).`,

        t: {

            en: { title: "Menu / Flyer", label: "Business / Restaurant Name", description: "Display products or dishes visually.", guidance: "A <b>Menu or Flyer</b> is designed to present information clearly and legibly, divided into categories and items." },

            he: { title: "תפריט / פלאייר", label: "שם העסק / מסעדה", description: "הצג מוצרים או מנות בצורה ויזואלית.", guidance: "<b>תפריט או פלאייר</b> נועד להציג מידע בצורה ברורה וקלה לקריאה, מחולק לקטגוריות ופריטים." },

            ar: { title: "قائمة / نشرة", label: "اسم العمل / المطعم", description: "اعرض المنتجات أو الأطباق بصرياً.", guidance: "<b>القائمة أو النشرة</b> مصممة لعرض المعلومات بوضوح ومقروئية، مقسمة إلى فئات وعناصر." },
            ja: { title: "メニュー / チラシ", label: "ビジネス名 / レストラン名", description: "製品や料理を視覚的に表示します。", guidance: "<b>メニューやチラシ</b>は、情報を明確で読みやすく提示するよう設計されており、カテゴリーとアイテムに分かれています。" },
            es: { title: "Menú / Folleto", label: "Nombre del Negocio / Restaurante", description: "Muestra productos o platos visualmente.", guidance: "Un <b>Menú o Folleto</b> está diseñado para presentar información de forma clara y legible, dividida en categorías y artículos." },

            fr: { title: "Menu / Flyer", label: "Nom de l'Entreprise / Restaurant", description: "Affichez des produits ou des plats de manière visuelle.", guidance: "Un <b>Menu ou Flyer</b> est conçu pour présenter des informations de manière claire et lisible, divisé en catégories et articles." },
            de: { title: "Menü / Flyer", label: "Geschäftsname / Restaurantname", description: "Zeigen Sie Produkte oder Gerichte visuell an.", guidance: "Ein <b>Menü oder Flyer</b> ist darauf ausgelegt, Informationen klar und lesbar zu präsentieren, unterteilt in Kategorien und Artikel." },
            ru: { title: "Меню / Листовка", label: "Название Бизнеса / Ресторана", description: "Визуально отображайте продукты или блюда.", guidance: "<b>Меню или Листовка</b> предназначены для четкого и разборчивого представления информации, разделенной на категории и элементы." },
            zh: { title: "菜单 / 传单", label: "企业名称 / 餐厅名称", description: "视觉展示产品或菜肴。", guidance: "<b>菜单或传单</b>旨在清晰易读地呈现信息，分为类别和项目。" }
        }

    },

    product: {

        img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop",

        fields: ['pricing'],

        structurePrompt: `Build a product page with the following sections only: 1. Main section (id="home") with a product image, name, price, and a purchase button. 2. Detailed description section (id="description").`,

        t: {

            en: { title: "Product Page", label: "Product Name", description: "Sell a specific product.", guidance: "A <b>Product Page</b> focuses on a single product, showcasing its features and benefits to lead to a purchase." },

            he: { title: "דף מוצר", label: "שם המוצר", description: "מכור מוצר ספציפי.", guidance: "<b>דף מוצר</b> מתמקד במוצר אחד, מציג את התכונות והתועלות שלו במטרה להוביל לרכישה." },

            es: { title: "Página de Producto", label: "Nombre del Producto", description: "Vende un producto específico.", guidance: "Una <b>Página de Producto</b> se centra en un solo producto, mostrando sus características y beneficios para conducir a una compra." },

            fr: { title: "Page Produit", label: "Nom du Produit", description: "Vendez un produit spécifique.", guidance: "Une <b>Page Produit</b> se concentre sur un seul produit, mettant en valeur ses caractéristiques et avantages pour inciter à l'achat." }

        }

    },

    artist: {

        img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop",

        fields: ['websiteLink'],

        structurePrompt: `Build an artist page with the following sections only: 1. Header with internal navigation (Biography, Gallery, Contact) and also the provided external links ('Main Link', 'Additional External Link'). 2. Hero Section (id="home") with a picture and the artist's name. 3. Biography section (id="bio"). 4. Works gallery (id="gallery"). 5. Contact details (id="contact").`,

        t: {

            en: { title: "Artist Page", label: "Artist Name", description: "Promote yourself and your work.", guidance: "An <b>Artist Page</b> is a digital portfolio, showcasing your creations and personal story." },

            he: { title: "דף אומן", label: "שם האומן", description: "קדם את עצמך ואת היצירה שלך.", guidance: "<b>דף אומן</b> הוא תיק עבודות דיגיטלי, המציג את היצירות שלך ואת הסיפור האישי שלך." },

            es: { title: "Página de Artista", label: "Nombre del Artista", description: "Promociónate a ti mismo y a tu trabajo.", guidance: "Una <b>Página de Artista</b> es un portafolio digital, que muestra tus creaciones y tu historia personal." },

            fr: { title: "Page d'Artiste", label: "Nom de l'Artiste", description: "Faites votre promotion et celle de votre travail.", guidance: "Une <b>Page d'Artiste</b> est un portfolio numérique, présentant vos créations et votre histoire personnelle." }

        }

    },

    businessCard: {

        img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1887&auto=format&fit=crop",

        fields: [],

        structurePrompt: `Build a digital business card designed as a single central card (id="vcard"). It must contain a picture, name, title, short description, and clear action buttons for contact.`,

        t: {

            en: { title: "Digital Business Card", label: "Your Name", description: "A personal, focused, and impressive page.", guidance: "A <b>Digital Business Card</b> is a simple and focused page, centralizing all your contact methods in one place." },

            he: { title: "כרטיס ביקור דיגיטלי", label: "השם שלך", description: "דף אישי, ממוקד ומרשים.", guidance: "<b>כרטיס ביקור דיגיטלי</b> הוא דף פשוט וממוקד, המרכז את כל דרכי יצירת הקשר איתך במקום אחד." },

            es: { title: "Tarjeta de Visita Digital", label: "Tu Nombre", description: "Una página personal, enfocada e impresionante.", guidance: "Una <b>Tarjeta de Visita Digital</b> es una página simple y enfocada, que centraliza todos tus métodos de contacto en un solo lugar." },

            fr: { title: "Carte de Visite Numérique", label: "Votre Nom", description: "Une page personnelle, ciblée et impressionnante.", guidance: "Une <b>Carte de Visite Numérique</b> est une page simple et ciblée, centralisant toutes vos méthodes de contact en un seul endroit." }

        }

    },

    event: {

        img: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?q=80&w=1887&auto=format&fit=crop",

        fields: ['eventDetails'],

        structurePrompt: `Build an event invitation with the following sections: 1. Hero Section (id="home") with the event name and date. 2. Countdown timer (id="countdown-timer") with elements having IDs: days, hours, minutes, seconds. **Very important**: The display order for Hebrew should be right-to-left: days, hours, minutes, seconds. 3. Event details (id="details") with location, time, and additional information. 4. RSVP form (id="rsvp").`,

        t: {

            en: { title: "Event Invitation", label: "Event Name", description: "Invite people to a special event.", guidance: "An <b>Event Invitation</b> is a page designed to create excitement and provide all important information for an upcoming event." },

            he: { title: "הזמנה לאירוע", label: "שם האירוע", description: "הזמן אנשים לאירוע מיוחד.", guidance: "<b>הזמנה לאירוע</b> היא דף שנועד לייצר התרגשות ולספק את כל המידע החשוב לקראת אירוע קרוב." },

            es: { title: "Invitación a Evento", label: "Nombre del Evento", description: "Invita a gente a un evento especial.", guidance: "Una <b>Invitación a Evento</b> es una página diseñada para crear expectación y proporcionar toda la información importante para un próximo evento." },

            fr: { title: "Invitation à un Événement", label: "Nom de l'Événement", description: "Invitez des personnes à un événement spécial.", guidance: "Une <b>Invitation à un Événement</b> est une page conçue pour susciter l'enthousiasme et fournir toutes les informations importantes pour un événement à venir." }

        }

    },

    course: {

        img: "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=2072&auto=format&fit=crop",

        fields: ['courseDetails', 'websiteLink'],

        structurePrompt: `Build a course page with the following sections: 1. Header with navigation containing the provided external links ('Main Link', 'Additional External Link'). 2. Hero Section (id="home") with the course name and a central promise. 3. Countdown timer (id="countdown-timer") with elements having IDs: days, hours, minutes, seconds. **Very important**: The display order for Hebrew should be right-to-left: days, hours, minutes, seconds. 4. "About the Course" section (id="about") with a detailed description. 5. "About the Instructor" section (id="instructor") with a **circular** image (class="rounded-full"), the instructor's name (from data), and a short description. 6. "Who is this course for" section (id="for-whom"). 7. Course details (id="details") - location. 8. A prominent registration button that leads to the provided registration link.`,

        t: {

            en: { title: "Course Page", label: "Course Name", description: "Market and register for a course or workshop.", guidance: "A <b>Course Page</b> is designed to market a course or workshop, introduce the instructor, and provide all necessary information for registration." },

            he: { title: "דף קורס", label: "שם הקורס", description: "שיווק והרשמה לקורס או סדנה.", guidance: "<b>דף קורס</b> נועד לשווק קורס או סדנה, להציג את המרצה, ולספק את כל המידע הדרוש להרשמה." },

            es: { title: "Página de Curso", label: "Nombre del Curso", description: "Promociona e inscribe a un curso o taller.", guidance: "Una <b>Página de Curso</b> está diseñada para promocionar un curso o taller, presentar al instructor y proporcionar toda la información necesaria para la inscripción." },

            fr: { title: "Page de Cours", label: "Nom du Cours", description: "Faites la promotion et l'inscription à un cours ou un atelier.", guidance: "Une <b>Page de Cours</b> est conçue pour promouvoir un cours ou un atelier, présenter l'instructeur et fournir toutes les informations nécessaires à l'inscription." }

        }

    },

    portfolio: {

        img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",

        fields: ['websiteLink'],

        structurePrompt: "Build a portfolio page with the following sections: 1. Header with navigation. 2. Hero Section (id='home') with a professional statement. 3. 'Featured Projects' section (id='projects') with a visual gallery of works. 4. 'Services' or 'Skills' section (id='skills'). 5. 'About' section (id='about'). 6. Contact section (id='contact').",

        t: {

            en: { title: "Portfolio", label: "Your Name / Agency Name", description: "Showcase your projects and skills.", guidance: "A <b>Portfolio</b> is where you display your best work, tell your story, and attract new clients." },

            he: { title: "תיק עבודות", label: "השם שלך / שם הסוכנות", description: "הצג את הפרויקטים והכישורים שלך.", guidance: "<b>תיק עבודות</b> הוא המקום להציג את העבודות הטובות ביותר שלך, לספר על עצמך ולמשוך לקוחות חדשים." },

            es: { title: "Portafolio", label: "Tu Nombre / Nombre de la Agencia", description: "Muestra tus proyectos y habilidades.", guidance: "Un <b>Portafolio</b> es donde muestras tu mejor trabajo, cuentas tu historia y atraes a nuevos clientes." },

            fr: { title: "Portfolio", label: "Votre Nom / Nom de l'Agence", description: "Présentez vos projets et vos compétences.", guidance: "Un <b>Portfolio</b> est l'endroit où vous présentez votre meilleur travail, racontez votre histoire et attirez de nouveaux clients." }

        }

    },

    realEstate: {

        img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop",

        fields: ['propertyDetails'],

        structurePrompt: "Build a real estate property landing page with the following sections: 1. Hero Section with a primary image of the property, address, and price. 2. Image gallery (id='gallery'). 3. 'Property Description' section (id='description') with marketing text. 4. 'Technical Specs' section (id='specs') showing the number of bedrooms, bathrooms, and square meters/feet. 5. Agent contact section (id='contact').",

        t: {

            en: { title: "Property for Sale", label: "Property Address", description: "A stunning landing page to sell a real estate property.", guidance: "A <b>Property Page</b> showcases a specific property with all important details: photos, description, technical specs, and agent contact information." },

            he: { title: "נכס למכירה", label: "כתובת הנכס", description: "דף נחיתה מרהיב למכירת נכס נדל\"ן.", guidance: "<b>דף נכס</b> מציג נכס ספציפי עם כל הפרטים החשובים: תמונות, תיאור, מפרט טכני ופרטי יצירת קשר עם הסוכן." },

            es: { title: "Propiedad en Venta", label: "Dirección de la Propiedad", description: "Una impresionante página de aterrizaje para vender una propiedad inmobiliaria.", guidance: "Una <b>Página de Propiedad</b> muestra una propiedad específica con todos los detalles importantes: fotos, descripción, especificaciones técnicas e información de contacto del agente." },

            fr: { title: "Propriété à Vendre", label: "Adresse de la Propriété", description: "Une superbe page de destination pour vendre un bien immobilier.", guidance: "Une <b>Page Propriété</b> présente un bien spécifique avec tous les détails importants : photos, description, spécifications techniques et coordonnées de l'agent." }

        }

    },

    onlineStore: {

        img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2340&auto=format&fit=crop",

        fields: ['productManagement'],

        structurePrompt: `Build a ${data.style} online store HTML page with these requirements:

1. Header with ${data.mainName || 'Store Name'} logo
2. Product catalog section with 6 product cards
3. Each product card MUST have a button with onclick="addToCart('ProductName', price, 'imageURL')"
4. Include these exact empty divs for JavaScript: <div id="cart-sidebar"></div> and <span id="cart-count"></span>
5. DO NOT include any "ניהול" or "Management" buttons
6. Add contact form at bottom

CRITICAL: Return complete valid HTML starting with <!DOCTYPE html> and ending with </html>. Max 500 lines.`,

        t: {

            en: { title: "Online Store", label: "Store Name", description: "Create a complete online store.", guidance: "An <b>Online Store</b> is a complete e-commerce website with product catalog, shopping cart, and checkout functionality." },

            he: { title: "חנות מקוונת", label: "שם החנות", description: "צור חנות מקוונת מלאה.", guidance: "<b>חנות מקוונת</b> היא אתר מסחר אלקטרוני מלא עם קטלוג מוצרים, עגלת קניות ופונקציית תשלום." },

            ar: { title: "متجر إلكتروني", label: "اسم المتجر", description: "أنشئ متجرًا إلكترونيًا كاملاً.", guidance: "<b>المتجر الإلكتروني</b> هو موقع تجارة إلكترونية كامل مع كتالوج منتجات وعربة تسوق ووظيفة دفع." }
        }
    }
};

// Export for use in main HTML file
if (typeof module !== 'undefined' && module.exports) {
    module.exports = pageTemplates;
}
