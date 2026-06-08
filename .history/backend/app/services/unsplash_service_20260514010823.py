"""
Service d'intégration avec l'API Unsplash (gratuit, sans clé requise).
Récupère des images pour les questions de QCM.
"""
import logging
import requests
from typing import Optional
from urllib.parse import quote

_LOGGER = logging.getLogger(__name__)
_UNSPLASH_API_BASE = "https://api.unsplash.com"
_UNSPLASH_SEARCH_ENDPOINT = f"{_UNSPLASH_API_BASE}/search/photos"
_TIMEOUT = 5.0


class UnsplashService:
    """Service pour récupérer des images depuis Unsplash sans clé API."""

    @staticmethod
    def search_image(query: str, width: int = 800, height: int = 600) -> Optional[str]:
        """
        Récupère une URL d'image depuis Unsplash basée sur la description.
        
        Args:
            query: Description/mot-clé pour la recherche
            width: Largeur souhaitée (param URL uniquement)
            height: Hauteur souhaitée (param URL uniquement)
            
        Returns:
            URL de l'image ou None en cas d'erreur
        """
        if not query or not isinstance(query, str):
            _LOGGER.warning("Invalid query for Unsplash: %s", query)
            return None

        try:
            # Nettoyage de la requête
            clean_query = query.strip()[:200]  # Limiter la longueur
            if not clean_query:
                return None

            # Utiliser les sources Unsplash publiques sans clé
            # Format: https://source.unsplash.com/800x600/?query
            image_url = f"https://source.unsplash.com/{width}x{height}/?{quote(clean_query)}"
            
            # Vérifier que l'URL est accessible
            response = requests.head(image_url, timeout=_TIMEOUT, allow_redirects=True)
            if response.status_code == 200:
                _LOGGER.info("✅ Image found for query: %s -> %s", clean_query, image_url)
                return image_url
            else:
                _LOGGER.warning("⚠️ Image not available for query: %s (status %s)", clean_query, response.status_code)
                return None

        except requests.RequestException as e:
            _LOGGER.error("❌ Unsplash request failed for query '%s': %s", query, e)
            return None
        except Exception as e:
            _LOGGER.error("❌ Unexpected error in Unsplash service for query '%s': %s", query, e)
            return None

    @staticmethod
    def search_image_fallback(query: str) -> Optional[str]:
        """
        Version simplifiée sans vérification - retourne directement l'URL.
        Utile pour les cas où on accepte les images même si elles ne sont pas vérifiées.
        """
        if not query or not isinstance(query, str):
            return None

        try:
            clean_query = query.strip()[:200]
            if not clean_query:
                return None
            
            image_url = f"https://source.unsplash.com/800x600/?{quote(clean_query)}"
            _LOGGER.info("📸 Generated image URL (unverified): %s", image_url)
            return image_url
        except Exception as e:
            _LOGGER.error("Error generating Unsplash URL: %s", e)
            return None
