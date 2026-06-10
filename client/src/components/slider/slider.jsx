import { useState, useEffect } from "react";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function PropertySlider({ images, onFullscreenChange }) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        onFullscreenChange?.(isFullscreen);
    }, [isFullscreen, onFullscreenChange]);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
        className: "property-slider"
    };

    const fullscreenSettings = {
        ...settings,
        autoplay: false,
        className: "fullscreen-slider"
    };

    return (
        <div className="relative w-full">
            <style>{`
                .property-slider .slick-prev,
                .property-slider .slick-next { z-index: 1; width: 40px; height: 40px; }
                .property-slider .slick-prev:before,
                .property-slider .slick-next:before { font-size: 40px; color: #334155 !important; opacity: 0.9; }
                .property-slider .slick-prev { left: 15px; }
                .property-slider .slick-next { right: 15px; }
                .property-slider .slick-dots { bottom: 15px; }
                .property-slider .slick-dots li button:before { font-size: 12px; color: #64748b; opacity: 1; }
                .property-slider .slick-dots li.slick-active button:before { color: #7c3aed; opacity: 1; }

                .fullscreen-slider .slick-prev,
                .fullscreen-slider .slick-next { z-index: 1; width: 50px; height: 50px; }
                .fullscreen-slider .slick-prev:before,
                .fullscreen-slider .slick-next:before { font-size: 50px; opacity: 0.8; }
                .fullscreen-slider .slick-prev { left: -60px; }
                .fullscreen-slider .slick-next { right: -60px; }
                .fullscreen-slider .slick-dots { bottom: -40px; }
                .fullscreen-slider .slick-dots li button:before { font-size: 12px; color: white; opacity: 0.7; }
                .fullscreen-slider .slick-dots li.slick-active button:before { color: white; opacity: 1; }

                @media (max-width: 768px) {
                    .property-slider .slick-prev, .property-slider .slick-next { width: 30px; height: 30px; }
                    .property-slider .slick-prev:before, .property-slider .slick-next:before { font-size: 30px; }
                }
            `}</style>
            {isFullscreen && (
                <div className="fixed left-0 top-0 z-[1000] flex h-screen w-screen items-center justify-center bg-black/90">
                    <Slider {...fullscreenSettings}>
                        {images.map((image, index) => (
                            <div key={index} className="slide">
                                <img src={image} alt={`Property ${index + 1}`} className="h-[80vh] w-full object-contain" />
                            </div>
                        ))}
                    </Slider>
                    <button
                        className="absolute right-5 top-5 cursor-pointer bg-transparent p-2.5 text-[40px] leading-none text-white opacity-80 transition hover:opacity-100"
                        onClick={() => setIsFullscreen(false)}
                    >
                        ×
                    </button>
                </div>
            )}
            
            <div className="h-[min(70vh,560px)] min-h-[280px] w-full cursor-pointer" onClick={() => setIsFullscreen(true)}>
                <Slider {...settings}>
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="flex h-[min(70vh,560px)] min-h-[280px] items-center justify-center bg-slate-100 max-md:h-[min(55vh,360px)] max-md:min-h-[240px]"
                        >
                            <img
                                src={image}
                                alt={`Property ${index + 1}`}
                                className="h-full w-full rounded-lg object-contain object-center"
                            />
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
}

export default PropertySlider;
