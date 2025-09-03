/**
 * CriticalCSS Component
 * Inlines critical CSS for above-the-fold content to improve initial page load performance
 */
function CriticalCSS() {
  return (
    <style jsx global>{`
      /* Critical CSS for above-the-fold content */
      .main-content {
        min-height: 100vh;
        background-color: #ffffff;
      }
      
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1.5rem;
      }
      
      /* Loading states */
      .loading-skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, transparent 37%, #f0f0f0 63%);
        background-size: 400% 100%;
        animation: loading 1.4s ease-in-out infinite;
      }
      
      @keyframes loading {
        0% {
          background-position: 100% 50%;
        }
        100% {
          background-position: -100% 50%;
        }
      }
      
      /* Header critical styles */
      header {
        position: sticky;
        top: 0;
        z-index: 50;
        background-color: #ffffff;
        border-bottom: 1px solid #e5e7eb;
      }
      
      /* Hero section critical styles */
      .hero-section {
        position: relative;
        overflow: hidden;
      }
      
      /* Campaign card critical styles */
      .campaign-card {
        background: #ffffff;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
      }
      
      .campaign-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
      }
      
      /* Button critical styles */
      .btn-primary {
        background-color: #3b82f6;
        color: #ffffff;
        border: none;
        border-radius: 0.375rem;
        padding: 0.5rem 1rem;
        font-weight: 500;
        transition: background-color 0.2s;
      }
      
      .btn-primary:hover {
        background-color: #2563eb;
      }
      
      /* Grid layout critical styles */
      .grid {
        display: grid;
        gap: 1.5rem;
      }
      
      @media (min-width: 768px) {
        .grid-cols-md-2 {
          grid-template-columns: repeat(2, 1fr);
        }
        .grid-cols-md-3 {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      
      @media (min-width: 1024px) {
        .grid-cols-lg-3 {
          grid-template-columns: repeat(3, 1fr);
        }
        .grid-cols-lg-4 {
          grid-template-columns: repeat(4, 1fr);
        }
      }
      
      /* Text and typography critical styles */
      .text-heading {
        font-size: 2rem;
        font-weight: 700;
        line-height: 1.2;
        color: #1f2937;
      }
      
      .text-subheading {
        font-size: 1.25rem;
        font-weight: 600;
        color: #374151;
      }
      
      .text-body {
        font-size: 1rem;
        line-height: 1.5;
        color: #6b7280;
      }
    `}</style>
  );
}

export default CriticalCSS;