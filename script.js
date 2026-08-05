(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const header = $('#site-header');
  const menuButton = $('.menu-toggle');
  const mobileMenu = $('#mobile-menu');
  const toast = $('#toast');

  const galleryItems = [
    ['assets/images/client-gallery-01.webp', 'Caftan bordeaux royal'],
    ['assets/images/client-gallery-02.webp', 'Caftan bordeaux brodé'],
    ['assets/images/client-gallery-03.webp', 'Caftan bleu et or'],
    ['assets/images/client-gallery-04.webp', 'Caftan ivoire avec voile'],
    ['assets/images/client-gallery-05.webp', 'Caftan gris perlé profil'],
    ['assets/images/client-gallery-06.webp', 'Caftan gris argenté avec voile'],
    ['assets/images/client-gallery-07.webp', 'Caftan ivoire dos brodé'],
    ['assets/images/client-gallery-08.webp', 'Caftan ivoire assise'],
    ['assets/images/client-gallery-09.webp', 'Caftan rouge et or'],
    ['assets/images/client-gallery-10.webp', 'Parure rouge et or'],
    ['assets/images/client-gallery-11.webp', 'Caftan ivoire et bijoux scintillants'],
    ['assets/images/client-gallery-12.webp', 'Takchita verte et voile blanc'],
    ['assets/images/client-gallery-13.webp', 'Caftan bleu royal assise'],
    ['assets/images/client-gallery-14.webp', 'Caftan bleu royal portrait'],
    ['assets/images/client-gallery-15.webp', 'Caftan noir et or'],
    ['assets/images/client-gallery-16.webp', 'Portrait en caftan noir et or'],
    ['assets/images/client-gallery-17.webp', 'Caftan bleu canard avec perles'],
    ['assets/images/client-gallery-18.webp', 'Détail du caftan bleu canard'],
    ['assets/images/client-gallery-19.webp', 'Portrait de profil en caftan bleu canard'],
    ['assets/images/client-gallery-20.webp', 'Caftan blanc en pied'],
    ['assets/images/client-gallery-21.webp', 'Portrait en caftan ivoire et or'],
    ['assets/images/client-gallery-22.webp', 'Caftan vert émeraude'],
    ['assets/images/client-gallery-23.webp', 'Caftan vert émeraude assise'],
    ['assets/images/client-gallery-24.webp', 'Caftan ivoire et or en pied'],
    ['assets/images/client-gallery-25.webp', 'Portrait en caftan ivoire et or'],
    ['assets/images/client-gallery-26.webp', 'Portrait en caftan vert'],
    ['assets/images/client-gallery-27.webp', 'Caftan rose brodé devant miroir']
  ];

  let lightboxIndex = 0;
  let toastTimer;
  let slideIndex = 0;
  let sliderTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function setMenu(open) {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    mobileMenu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    menuButton.innerHTML = `<svg><use href="#${open ? 'i-close' : 'i-menu'}"/></svg>`;
  }

  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  $$('#mobile-menu a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false);
  });

  const stickyObserver = new IntersectionObserver(([entry]) => {
    header.classList.toggle('is-sticky', !entry.isIntersecting && window.innerWidth > 1020);
  }, { threshold: 0.02 });
  stickyObserver.observe($('#accueil'));

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      $$('.nav-link').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-35% 0px -55%', threshold: 0 });
  $$('main section[id]').forEach(section => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(element => revealObserver.observe(element));

  function downloadVCard() {
    const vcard = [
      'BEGIN:VCARD', 'VERSION:3.0', 'FN:Negafa Jolie Dame', 'ORG:Negafa Jolie Dame',
      'TEL;TYPE=CELL,VOICE:+212770172543', 'TEL;TYPE=CELL,WHATSAPP:+212770172543',
      'EMAIL:', 'URL:https://www.instagram.com/negafa_jolie_dame',
      'ADR;TYPE=WORK:;;Varese;;;Italia', 'NOTE:Caftans, takchitas, bijoux et habillage complet de la mariée.', 'END:VCARD'
    ].join('\r\n');
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'Negafa-Jolie-Dame.vcf';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast('Contact prêt à être ajouté à votre téléphone.');
  }
  $$('.save-contact').forEach(button => button.addEventListener('click', downloadVCard));

  const galleryDialog = $('#gallery-dialog');
  const dialogGrid = $('#dialog-grid');
  const lightbox = $('#lightbox');
  const lightboxImage = $('#lightbox-image');
  const lightboxCaption = $('#lightbox-caption');

  galleryItems.forEach(([src, caption], index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Agrandir : ${caption}`);
    button.innerHTML = `<img src="${src}" alt="${caption}" loading="lazy">`;
    button.addEventListener('click', () => openLightbox(index));
    dialogGrid.append(button);
  });

  function openGallery() {
    if (typeof galleryDialog.showModal === 'function') galleryDialog.showModal();
  }
  function closeGallery() { if (galleryDialog.open) galleryDialog.close(); }
  $('#open-gallery').addEventListener('click', openGallery);
  $('[data-close-gallery]').addEventListener('click', closeGallery);
  galleryDialog.addEventListener('click', event => { if (event.target === galleryDialog) closeGallery(); });

  function renderLightbox() {
    const [src, caption] = galleryItems[lightboxIndex];
    lightboxImage.src = src;
    lightboxImage.alt = caption;
    lightboxCaption.textContent = caption;
  }
  function openLightbox(index) {
    lightboxIndex = index;
    renderLightbox();
    if (galleryDialog.open) galleryDialog.close();
    if (typeof lightbox.showModal === 'function') lightbox.showModal();
  }
  function moveLightbox(direction) {
    lightboxIndex = (lightboxIndex + direction + galleryItems.length) % galleryItems.length;
    renderLightbox();
  }
  $$('.gallery-card').forEach(card => card.addEventListener('click', () => openLightbox(Number(card.dataset.index))));
  $('.lightbox-close').addEventListener('click', () => lightbox.close());
  $('.lightbox-prev').addEventListener('click', () => moveLightbox(-1));
  $('.lightbox-next').addEventListener('click', () => moveLightbox(1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  document.addEventListener('keydown', event => {
    if (!lightbox.open) return;
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
  });

  const testimonials = $$('.testimonial');
  const dots = $$('.slider-dots button');
  function showSlide(index) {
    slideIndex = (index + testimonials.length) % testimonials.length;
    testimonials.forEach((item, i) => item.classList.toggle('active', i === slideIndex));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === slideIndex));
  }
  function restartSlider() {
    clearInterval(sliderTimer);
    sliderTimer = setInterval(() => showSlide(slideIndex + 1), 6500);
  }
  $('.slider-arrow.previous').addEventListener('click', () => { showSlide(slideIndex - 1); restartSlider(); });
  $('.slider-arrow.next').addEventListener('click', () => { showSlide(slideIndex + 1); restartSlider(); });
  dots.forEach((dot, index) => dot.addEventListener('click', () => { showSlide(index); restartSlider(); }));
  restartSlider();

  const form = $('#contact-form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const status = $('.form-status', form);
    const fields = $$('input, textarea', form);
    fields.forEach(field => field.classList.remove('invalid'));
    const invalid = fields.filter(field => !field.checkValidity());
    if (invalid.length) {
      invalid.forEach(field => field.classList.add('invalid'));
      invalid[0].focus();
      status.textContent = 'Merci de compléter correctement tous les champs.';
      status.className = 'form-status error';
      return;
    }
    const data = new FormData(form);
    const date = new Date(`${data.get('date')}T12:00:00`);
    const formattedDate = Number.isNaN(date.getTime()) ? data.get('date') : new Intl.DateTimeFormat('fr-FR').format(date);
    const text = `Bonjour Negafa Jolie Dame,\n\nJe m'appelle ${data.get('name')}.\nDate du mariage : ${formattedDate}.\n\n${data.get('message')}`;
    status.textContent = 'Votre message est prêt. Ouverture de WhatsApp…';
    status.className = 'form-status';
    window.open(`https://wa.me/212770172543?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    showToast('WhatsApp a été ouvert avec votre message.');
  });

  $('#year').textContent = new Date().getFullYear();
})();
