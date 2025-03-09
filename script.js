document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation...');
    
    // Variables pour la galerie filtrée par service et la modal
    const serviceItems = document.querySelectorAll('.service-item');
    const portfolioGallery = document.getElementById('portfolio-gallery');
    const currentFilterText = document.getElementById('current-filter');
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    const closeBtn = document.querySelector('.modal-close');
    const modalPrevBtn = document.getElementById('modal-prev');
    const modalNextBtn = document.getElementById('modal-next');
    
    // Liste des services disponibles
    const services = [
        'maconnerie',
        'placo',
        'charpente',
        'carrelage',
        'cloture',
        'piscine',
        'terrassement'
    ];

    // Nombre approximatif d'images par service (pour la première charge)
    // Ces nombres seront mis à jour dynamiquement lors du chargement des images
    const imageCountsByService = {
        maconnerie: 10,
        placo: 10,
        charpente: 10,
        carrelage: 10, 
        cloture: 10,
        piscine: 10,
        terrassement: 10
    };
    
    let currentService = 'tous'; // Service actif par défaut
    let currentGalleryImages = []; // Tableau pour stocker les chemins d'images actuellement affichés
    let currentModalImageIndex = 0; // Index de l'image actuellement affichée dans la modal
    
    // Vérifier si les éléments existent
    if (!modal || !modalImg || !closeBtn || !portfolioGallery || !modalPrevBtn || !modalNextBtn) {
        console.error('Éléments modal ou galerie manquants');
        return;
    }
    
    console.log('Éléments de la galerie trouvés');
    
    // Fonction auxiliaire pour tester si une image existe avec contournement du cache
    function imageExists(url, callback) {
        const img = new Image();
        // Ajouter un paramètre aléatoire pour contourner le cache
        const cacheBuster = `?v=${new Date().getTime()}`;
        img.onload = function() { callback(true); };
        img.onerror = function() { callback(false); };
        img.src = url + cacheBuster;
    }
    
    // Fonction pour réinitialiser le cache des images
    function resetImageCache() {
        // Réinitialiser le compteur d'images pour chaque service
        for (let service in imageCountsByService) {
            imageCountsByService[service] = 10; // Valeur par défaut
        }
        
        // Vider le tableau des images actuelles
        currentGalleryImages = [];
        
        // Effacer le contenu de la galerie
        portfolioGallery.innerHTML = '';
        
        console.log('Cache d\'images réinitialisé');
        
        // Recharger les images du service actuel
        renderFilteredGallery(currentService);
    }
    
    // Exposer la fonction au scope global pour pouvoir l'appeler depuis la console
    window.actualiserImages = resetImageCache;

    // Fonction pour générer la galerie filtrée
    function renderFilteredGallery(service) {
        // Mettre à jour le service actuel
        currentService = service;
        
        // Réinitialiser le tableau des images
        currentGalleryImages = [];
        
        // Mettre à jour le texte du filtre actuel
        const activeServiceItem = document.querySelector(`.service-item[data-service="${service}"]`);
        if (activeServiceItem) {
            currentFilterText.textContent = activeServiceItem.querySelector('h3').textContent;
        }
        
        // Effet de fade out
        portfolioGallery.classList.add('fade');
        
        // Vider la galerie
        setTimeout(() => {
            portfolioGallery.innerHTML = '';
            
            // Si on montre tous les services
            if (service === 'tous') {
                // Créer des éléments pour chaque service
                services.forEach(svcName => {
                    for (let i = 1; i <= imageCountsByService[svcName]; i++) {
                        const imagePath = `images/${svcName}/${i}.jpeg`;
                        
                        // Vérifier si l'image existe avant de l'ajouter
                        imageExists(imagePath, function(exists) {
                            if (exists) {
                                addImageToGallery(imagePath);
                                currentGalleryImages.push(imagePath); // Ajouter le chemin au tableau
                            }
                        });
                    }
                });
            } else {
                // Sinon on montre les images d'un service spécifique
                for (let i = 1; i <= 100; i++) { // On essaie jusqu'à 100 images (ajustable selon vos besoins)
                    const imagePath = `images/${service}/${i}.jpeg`;
                    
                    // Vérifier si l'image existe avant de l'ajouter
                    imageExists(imagePath, function(exists) {
                        if (exists) {
                            addImageToGallery(imagePath);
                            currentGalleryImages.push(imagePath); // Ajouter le chemin au tableau
                            // Mettre à jour le compteur pour ce service
                            imageCountsByService[service] = Math.max(imageCountsByService[service], i);
                        }
                    });
                }
            }
            
            // On retire l'effet de fade après un délai pour s'assurer que les images ont eu le temps de charger
            setTimeout(() => {
                portfolioGallery.classList.remove('fade');
            }, 500);
            
        }, 300); // Durée du fade out
    }

    // Fonction pour ajouter une image à la galerie
    function addImageToGallery(imagePath) {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = `Réalisation ${currentFilterText.textContent}`;
        img.dataset.path = imagePath; // Stocker le chemin pour référence
        
        // Gestion des erreurs d'image
        img.onerror = function() {
            this.src = 'https://via.placeholder.com/300x200?text=Image+non+trouvée';
        };
        
        // Ajouter les événements pour ouvrir la lightbox
        galleryItem.addEventListener('click', function() {
            // Trouver l'index de cette image dans le tableau
            currentModalImageIndex = currentGalleryImages.indexOf(imagePath);
            
            // Ouvrir la lightbox avec cette image
            openModal(imagePath);
        });
        
        // Assembler l'élément de galerie
        galleryItem.appendChild(img);
        portfolioGallery.appendChild(galleryItem);
    }
    
    // Fonction pour ouvrir la modal avec une image spécifique
    function openModal(imagePath) {
        modalImg.src = imagePath;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Empêcher le défilement
        
        // Afficher ou masquer les boutons de navigation selon le nombre d'images
        if (currentGalleryImages.length <= 1) {
            modalPrevBtn.style.display = 'none';
            modalNextBtn.style.display = 'none';
        } else {
            modalPrevBtn.style.display = 'flex';
            modalNextBtn.style.display = 'flex';
        }
    }
    
    // Fonction pour naviguer vers l'image précédente dans la modal
    function showPrevImage() {
        if (currentGalleryImages.length <= 1) return;
        
        currentModalImageIndex--;
        if (currentModalImageIndex < 0) {
            currentModalImageIndex = currentGalleryImages.length - 1;
        }
        
        modalImg.style.opacity = 0;
        
        setTimeout(() => {
            modalImg.src = currentGalleryImages[currentModalImageIndex];
            modalImg.style.opacity = 1;
        }, 300);
    }
    
    // Fonction pour naviguer vers l'image suivante dans la modal
    function showNextImage() {
        if (currentGalleryImages.length <= 1) return;
        
        currentModalImageIndex++;
        if (currentModalImageIndex >= currentGalleryImages.length) {
            currentModalImageIndex = 0;
        }
        
        modalImg.style.opacity = 0;
        
        setTimeout(() => {
            modalImg.src = currentGalleryImages[currentModalImageIndex];
            modalImg.style.opacity = 1;
        }, 300);
    }
    
    // Ajouter des événements de clic aux services
    serviceItems.forEach(item => {
        item.addEventListener('click', function() {
            // Retirer la classe active de tous les services
            serviceItems.forEach(service => service.classList.remove('active'));
            
            // Ajouter la classe active au service cliqué
            this.classList.add('active');
            
            // Obtenir le service sélectionné
            const selectedService = this.getAttribute('data-service');
            
            // Filtrer la galerie par le service sélectionné
            renderFilteredGallery(selectedService);
            
            // Défilement vers la galerie avec un délai plus long
            // pour s'assurer que toutes les opérations asynchrones sont terminées
            setTimeout(() => {
                const portfolioSection = document.getElementById('portfolio');
                if (portfolioSection) {
                    // Défiler vers la section portfolio avec une marge supérieure
                    portfolioSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Petite correction de position pour améliorer la visibilité
                    setTimeout(() => {
                        window.scrollBy({
                            top: -50, // Ajuster si nécessaire pour avoir une bonne marge
                            behavior: 'smooth'
                        });
                    }, 500);
                }
            }, 600); // Délai augmenté pour laisser le temps au rendu
        });
    });
    
    // Initialiser la galerie avec toutes les images
    renderFilteredGallery('tous');
    
    // Afficher un message dans la console pour indiquer comment actualiser les images
    console.info('Pour actualiser les images après modification des dossiers, utilisez la commande: actualiserImages()');
    
    // GESTION DE LA LIGHTBOX ET DE LA NAVIGATION
    
    // Navigation dans la modal avec les boutons
    modalPrevBtn.addEventListener('click', showPrevImage);
    modalNextBtn.addEventListener('click', showNextImage);
    
    // Navigation avec les touches du clavier
    document.addEventListener('keydown', function(e) {
        if (modal.style.display === 'flex') {
            if (e.key === 'ArrowLeft') {
                showPrevImage();
            } else if (e.key === 'ArrowRight') {
                showNextImage();
            } else if (e.key === 'Escape') {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        }
    });
    
    // Fermer la lightbox
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Réactiver le défilement
    });
    
    // Fermer en cliquant n'importe où
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
    
    // Thème sombre/clair
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    
    themeToggle.addEventListener('click', function() {
        if (document.body.hasAttribute('data-theme')) {
            document.body.removeAttribute('data-theme');
            themeIcon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeIcon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'dark');
        }
    });
    
    // Appliquer le thème sauvegardé
    if (localStorage.getItem('theme') === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
    }
    
    // Vérifier si l'API est disponible et si l'utilisateur préfère le thème sombre
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('theme')) {
        document.body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
    }
    
    // Header compact au défilement
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.classList.add('compact');
        } else {
            header.classList.remove('compact');
        }
    });
    
    // Navigation vers la section contact
    const contactBtn = document.getElementById('contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', function() {
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
    
    console.log('Initialisation terminée');
});