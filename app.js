/**
 * Accessible Tooltip Component
 * @author Natalia Krasnobaieva
 * @version 1.0.0
 */

class TooltipManager {
  constructor() {
      this.tooltip = null;
      this.activeTrigger = null;
      this.tooltipId = 'js-tooltip-element';
      this.hideTimeout = null;
      this.observer = null;
      
      this.init();
  }

  init() {
      this.createTooltipElement();
      this.makeElementsFocusable();
      this.attachEvents();
      this.observeDynamicContent();
  }

  makeElementsFocusable() {
      const focusableTags = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'];
      
      document.querySelectorAll('[data-tooltip]').forEach(el => {
          if (!document.body.contains(el)) return;
          
          if (el.tabIndex === -1 && !focusableTags.includes(el.tagName)) {
              el.tabIndex = 0;
          }
      });
  }

  createTooltipElement() {
      const existing = document.getElementById(this.tooltipId);
      if (existing) existing.remove();

      this.tooltip = document.createElement('div');
      this.tooltip.className = 'tooltip';
      this.tooltip.id = this.tooltipId;
      this.tooltip.setAttribute('role', 'tooltip');
      this.tooltip.setAttribute('aria-hidden', 'true');
      this.tooltip.innerHTML = `
          <div class="tooltip__content"></div>
          <div class="tooltip__arrow"></div>
      `;
      
      document.body.appendChild(this.tooltip);
  }

  observeDynamicContent() {
      this.observer = new MutationObserver(() => {
          this.makeElementsFocusable();
      });
      
      this.observer.observe(document.body, {
          childList: true,
          subtree: true
      });
  }

  attachEvents() {
      document.addEventListener('mouseenter', (e) => {
          const trigger = e.target.closest('[data-tooltip]');
          if (trigger) {
              clearTimeout(this.hideTimeout);
              this.show(trigger);
          }
      }, true);
      
      document.addEventListener('mouseleave', (e) => {
          const trigger = e.target.closest('[data-tooltip]');
          if (!trigger || !this.activeTrigger) return;
          
          if (e.target === trigger || trigger.contains(e.target)) {
              this.hideTimeout = setTimeout(() => {
                  if (!this.tooltip.matches(':hover')) {
                      this.hide();
                  }
              }, 150);
          }
      }, true);
      
      document.addEventListener('focusin', (e) => {
          const trigger = e.target.closest('[data-tooltip]');
          if (trigger) this.show(trigger);
      });
      
      document.addEventListener('focusout', (e) => {
          const trigger = e.target.closest('[data-tooltip]');
          if (trigger && this.activeTrigger === trigger) {
              const toElement = e.relatedTarget;
              if (!toElement || !toElement.closest('[data-tooltip]')) {
                  this.hide();
              }
          }
      });
      
      window.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && this.activeTrigger) {
              e.preventDefault();
              this.hide();
              if (this.activeTrigger && typeof this.activeTrigger.focus === 'function') {
                  this.activeTrigger.focus();
              }
          }
      });
      
      window.addEventListener('scroll', () => this.updatePosition(), { passive: true });
      window.addEventListener('resize', () => this.updatePosition(), { passive: true });
      window.addEventListener('orientationchange', () => {
          setTimeout(() => this.updatePosition(), 100);
      });
  }

  show(trigger) {
      if (this.activeTrigger === trigger) return;
      
      this.hide();
      this.activeTrigger = trigger;
      
      const content = trigger.getAttribute('data-tooltip');
      if (!content) return;
      
      this.tooltip.querySelector('.tooltip__content').textContent = content;
      
      trigger.setAttribute('aria-describedby', this.tooltipId);
      this.tooltip.setAttribute('aria-hidden', 'false');
      this.tooltip.setAttribute('data-show', '');
      
      this.updatePosition();
  }

  hide() {
      clearTimeout(this.hideTimeout);
      
      if (this.activeTrigger) {
          this.activeTrigger.removeAttribute('aria-describedby');
          this.activeTrigger = null;
      }
      
      this.tooltip.removeAttribute('data-show');
      this.tooltip.setAttribute('aria-hidden', 'true');
  }

  updatePosition() {
    if (!this.activeTrigger || !this.tooltip) return;

    const trigger = this.activeTrigger;
    const tooltip = this.tooltip;
    
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    if (tooltipRect.width === 0) return;
    
    const preferredPlacement = trigger.getAttribute('data-placement') || 'top';
    const offset = 10;
    const padding = 8;
    let placementsToTry = [preferredPlacement];
    const opposites = {
        'top': 'bottom',
        'bottom': 'top',
        'left': 'right',
        'right': 'left'
    };
    placementsToTry.push(opposites[preferredPlacement]);
    
    ['top', 'bottom', 'left', 'right'].forEach(p => {
        if (!placementsToTry.includes(p)) {
            placementsToTry.push(p);
        }
    });
    
    let placement = preferredPlacement;
    let coords = null;

    for (const tryPlacement of placementsToTry) {
        const tryCoords = this.getCoordinates(tryPlacement, triggerRect, tooltipRect, offset);
        
        if (this.checkIfFits(tryCoords, tooltipRect, padding)) {
            placement = tryPlacement;
            coords = tryCoords;
            break;
        }
    }

    if (!coords) {
        placement = preferredPlacement;
        coords = this.getCoordinates(preferredPlacement, triggerRect, tooltipRect, offset);
    }

    coords.left = Math.max(padding, Math.min(coords.left, window.innerWidth - tooltipRect.width - padding));
    coords.top = Math.max(padding, Math.min(coords.top, window.innerHeight - tooltipRect.height - padding));
    
    tooltip.setAttribute('data-p', placement);
    tooltip.style.transform = `translate(${Math.round(coords.left)}px, ${Math.round(coords.top)}px)`;
  }

  getCoordinates(placement, triggerRect, tooltipRect, offset) {
      switch (placement) {
          case 'top':
              return {
                  left: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
                  top: triggerRect.top - tooltipRect.height - offset
              };
          case 'bottom':
              return {
                  left: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
                  top: triggerRect.bottom + offset
              };
          case 'left':
              return {
                  left: triggerRect.left - tooltipRect.width - offset,
                  top: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
              };
          case 'right':
              return {
                  left: triggerRect.right + offset,
                  top: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
              };
          default:
              return {
                  left: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
                  top: triggerRect.top - tooltipRect.height - offset
              };
      }
  }

  checkIfFits(coords, tooltipRect, padding) {
      return coords.left >= padding &&
             coords.top >= padding &&
             coords.left + tooltipRect.width <= window.innerWidth - padding &&
             coords.top + tooltipRect.height <= window.innerHeight - padding;
  }

  destroy() {
      if (this.observer) {
          this.observer.disconnect();
      }
      
      window.removeEventListener('scroll', this.updatePosition);
      window.removeEventListener('resize', this.updatePosition);
      window.removeEventListener('orientationchange', this.updatePosition);
      
      if (this.tooltip && this.tooltip.parentNode) {
          this.tooltip.parentNode.removeChild(this.tooltip);
      }
      
      this.tooltip = null;
      this.activeTrigger = null;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
      new TooltipManager();
  });
} else {
  new TooltipManager();
}