import ImagesApiService from './img_service';
import portfolioCard from '../templates/portfolio_card.hbs';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix';

const refs = {
  searchForm: document.querySelector('.search-form'),
  galleryEL: document.querySelector('.gallery'),
  targetEl: document.querySelector('.target-element'),
};

let imagesApiService = new ImagesApiService();
const gallery = new SimpleLightbox('.gallery a');

refs.searchForm.addEventListener('submit', onSearch);

let totalPages = 0;

const options = {
  root: null,
  rootMargin: '50px',
  threshold: 1,
};

const observer = new IntersectionObserver(async entries => {
  const [targetEl] = await entries;

  if (targetEl.isIntersecting) {
    try {
      if (imagesApiService.page > 1) {
        fetchImages();
      }
      if (imagesApiService.page === 2) {
        responseToRequest();
      }
    } catch (error) {
      console.warn(error);
    }
  }
}, options);

const fetchImages = async function () {
  const data = await imagesApiService.fetchImages();
  const { hits, totalHits } = data;

  totalPages = totalHits;

  if (totalPages === 0) {
    return errorQuery();
  }
  if ((imagesApiService.page - 1) * imagesApiService.per_page >= totalPages) {
    observer.unobserve(refs.targetEl);
    endOfSearch();
  }

  refs.galleryEL.insertAdjacentHTML('beforeend', portfolioCard(hits));
  imagesApiService.incrementPage();
  gallery.refresh();
};

function onSearch(ele) {
  ele.preventDefault();

  imagesApiService.query = ele.currentTarget.elements.searchQuery.value.trim();
  imagesApiService.resetPage();
  imagesApiService.resetLoadedHits();
  clearGalleryContainer();

  if (!imagesApiService.query) {
    return errorQuery();
  }

  fetchImages();
  observer.observe(refs.targetEl);
}

function responseToRequest() {
  Notify.success(`Hooray! We found ${totalPages} images.`);
}
function errorQuery() {
  Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

function endOfSearch() {
  Notify.info("We're sorry, but you've reached the end of search results.");
}

function clearGalleryContainer() {
  refs.galleryEL.innerHTML = '';
}
