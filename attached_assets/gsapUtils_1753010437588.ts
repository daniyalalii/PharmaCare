import { gsap } from 'gsap';

// Page transitions
export const animatePageEnter = (element: HTMLElement) => {
  gsap.fromTo(element, 
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
  );
};

export const animatePageExit = (element: HTMLElement) => {
  return gsap.to(element, {
    opacity: 0,
    y: 20,
    duration: 0.3,
    ease: "power2.out"
  });
};

// Card animations
export const animateCard = (element: HTMLElement) => {
  gsap.from(element, {
    y: 50,
    opacity: 0,
    duration: 0.6,
    ease: "power2.out"
  });
};

export const animateCardHover = (element: HTMLElement) => {
  gsap.to(element, {
    y: -5,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    duration: 0.3,
    ease: "power2.out"
  });
};

export const animateCardLeave = (element: HTMLElement) => {
  gsap.to(element, {
    y: 0,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    duration: 0.3,
    ease: "power2.out"
  });
};

// Button animations
export const animateButtonClick = (element: HTMLElement) => {
  gsap.to(element, {
    scale: 0.95,
    duration: 0.1,
    yoyo: true,
    repeat: 1,
    ease: "power2.inOut"
  });
};

export const animateButtonHover = (element: HTMLElement) => {
  gsap.to(element, {
    scale: 1.05,
    duration: 0.2,
    ease: "power2.out"
  });
};

export const animateButtonLeave = (element: HTMLElement) => {
  gsap.to(element, {
    scale: 1,
    duration: 0.2,
    ease: "power2.out"
  });
};

// List animations
export const animateStaggerList = (elements: NodeListOf<Element>) => {
  gsap.from(elements, {
    x: -50,
    opacity: 0,
    duration: 0.4,
    stagger: 0.1,
    ease: "power2.out"
  });
};

export const animateTableRows = (elements: NodeListOf<Element>) => {
  gsap.from(elements, {
    x: -30,
    opacity: 0,
    duration: 0.3,
    stagger: 0.05,
    ease: "power2.out"
  });
};

// Modal animations
export const animateModalOpen = (element: HTMLElement) => {
  gsap.fromTo(element,
    { scale: 0.95, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
  );
};

export const animateModalClose = (element: HTMLElement) => {
  return gsap.to(element, {
    scale: 0.95,
    opacity: 0,
    duration: 0.2,
    ease: "power2.in"
  });
};

// Counter animations
export const animateCounter = (element: HTMLElement, target: number, duration: number = 2) => {
  gsap.to({ value: 0 }, {
    value: target,
    duration: duration,
    ease: "power2.out",
    onUpdate: function() {
      const currentValue = Math.floor(this.targets()[0].value);
      if (target > 1000) {
        element.textContent = '$' + currentValue.toLocaleString();
      } else {
        element.textContent = currentValue.toString();
      }
    }
  });
};

// Toast animations
export const animateToastIn = (element: HTMLElement) => {
  gsap.fromTo(element,
    { x: '100%', opacity: 0 },
    { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
  );
};

export const animateToastOut = (element: HTMLElement) => {
  return gsap.to(element, {
    x: '100%',
    opacity: 0,
    duration: 0.3,
    ease: "power2.in"
  });
};

// Loading animations
export const animateLoading = (element: HTMLElement) => {
  gsap.to(element, {
    rotation: 360,
    duration: 1,
    repeat: -1,
    ease: "none"
  });
};

// Form field animations
export const animateFieldError = (element: HTMLElement) => {
  gsap.to(element, {
    x: [-10, 10, -10, 10, 0],
    duration: 0.4,
    ease: "power2.out"
  });
};

export const animateFieldSuccess = (element: HTMLElement) => {
  gsap.to(element, {
    boxShadow: "0 0 10px rgba(34, 197, 94, 0.3)",
    duration: 0.3,
    yoyo: true,
    repeat: 1,
    ease: "power2.inOut"
  });
};

// Sidebar animations
export const animateSidebar = (element: HTMLElement) => {
  gsap.from(element, {
    x: -100,
    duration: 0.6,
    ease: "power2.out"
  });
};

export const animateSidebarItem = (element: HTMLElement, isActive: boolean = false) => {
  if (!isActive) {
    gsap.to(element, {
      x: 5,
      duration: 0.2,
      ease: "power2.out"
    });
  }
};

export const animateSidebarItemLeave = (element: HTMLElement, isActive: boolean = false) => {
  if (!isActive) {
    gsap.to(element, {
      x: 0,
      duration: 0.2,
      ease: "power2.out"
    });
  }
};

// Progress animations
export const animateProgress = (element: HTMLElement, progress: number) => {
  gsap.to(element, {
    width: `${progress}%`,
    duration: 0.3,
    ease: "power2.out"
  });
};

// Stats card animations
export const animateStatsCards = (elements: NodeListOf<Element>) => {
  gsap.from(elements, {
    y: 50,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: "power2.out"
  });
};

// Search results animations
export const animateSearchResults = (elements: NodeListOf<Element>) => {
  gsap.from(elements, {
    opacity: 0,
    y: 10,
    duration: 0.3,
    stagger: 0.05,
    ease: "power2.out"
  });
};
