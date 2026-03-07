'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLPageFlip from 'react-pageflip';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './PDFBook.module.css';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PageContainer = React.forwardRef((props, ref) => {
    return (
        <div className={styles.page} ref={ref} data-density="hard">
            <div className={styles.pageContent}>
                {props.children}
            </div>
        </div>
    );
});

PageContainer.displayName = 'PageContainer';

const PDFBook = ({ pdfUrl }) => {
    const [numPages, setNumPages] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [dimensions, setDimensions] = useState({ width: 300, height: 400 });
    const bookRef = useRef(null);
    const containerRef = useRef(null);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    // Handle responsiveness
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const isMobile = window.innerWidth < 768;

                // Available height for the book (accounting for header and controls)
                // On desktop, we want more margin around the book
                const verticalOffset = isMobile ? 150 : 250;
                const availableHeight = window.innerHeight - verticalOffset;

                // Aspect ratio of a standard A4/Menu page is roughly 1:1.41
                // On desktop, we limit the height more to make it smaller
                const desktopMaxHeight = 700;
                let targetHeight = isMobile
                    ? Math.min(availableHeight, 1000)
                    : Math.min(availableHeight, desktopMaxHeight);

                let targetWidth = targetHeight / 1.41;

                const maxWidth = isMobile ? containerWidth : (containerWidth / 2.5); // Smaller on desktop
                if (targetWidth > maxWidth) {
                    targetWidth = maxWidth;
                    targetHeight = targetWidth * 1.41;
                }

                setDimensions({
                    width: Math.floor(targetWidth),
                    height: Math.floor(targetHeight)
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const onFlip = (e) => {
        setCurrentPage(e.data);
    };

    return (
        <div className={styles.bookWrapper} ref={containerRef}>
            <div className={styles.bookContainer}>
                {pdfUrl && (
                    <Document
                        file={pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <div className={styles.loading}>
                                <Loader2 className={styles.spinner} size={40} />
                                <p>Preparing Book...</p>
                            </div>
                        }
                    >
                        {numPages && (
                            <HTMLPageFlip
                                width={dimensions.width}
                                height={dimensions.height}
                                size="fixed"
                                minWidth={200}
                                maxWidth={1200}
                                minHeight={300}
                                maxHeight={2000}
                                maxShadowOpacity={0.5}
                                showCover={true}
                                mobileScrollSupport={false}
                                useMouseEvents={true}
                                swipeDistance={30}
                                clickEventForward={true}
                                flippingTime={800}
                                onFlip={onFlip}
                                className={styles.flipBook}
                                ref={bookRef}
                                usePortrait={dimensions.width < 500}
                                startPage={0}
                                drawShadow={true}
                            >
                                {[...Array(numPages).keys()].map((p) => (
                                    <PageContainer key={p}>
                                        <Page
                                            pageNumber={p + 1}
                                            width={dimensions.width}
                                            renderAnnotationLayer={false}
                                            renderTextLayer={false}
                                            className={styles.pdfPage}
                                            loading={<div style={{ backgroundColor: 'var(--secondary)', width: dimensions.width, height: dimensions.height }} />}
                                        />
                                    </PageContainer>
                                ))}
                            </HTMLPageFlip>
                        )}
                    </Document>
                )}
            </div>

            {numPages && (
                <div className={styles.controls}>
                    <button
                        onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
                        className={styles.navButton}
                        disabled={currentPage === 0}
                    >
                        <ChevronLeft />
                    </button>

                    <span className={styles.pageInfo}>
                        {currentPage + 1} / {numPages}
                    </span>

                    <button
                        onClick={() => bookRef.current?.pageFlip()?.flipNext()}
                        className={styles.navButton}
                        disabled={currentPage === numPages - 1}
                    >
                        <ChevronRight />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PDFBook;
