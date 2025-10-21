/**
 * Inspirational Talk - Background Messaging System
 * Clean, declarative architecture for conditional phrase display
 */

class InspirationalTalk {
    constructor() {
        this.phrases = [];
        this.usedPhraseIndices = new Set();
        this.activeMessages = [];
        this.maxActiveMessages = 1;
        this.messageSpeedMultiplier = 1; // Can be controlled from settings
        this.container = null;
        this.fireworksClickCount = 0;

        this.init();
    }

    async init() {
        this.createContainer();
        await this.loadPhrases();
        this.setupEventListeners();
        this.startMessageFlow();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'inspirational-messages';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2;
        `;
        document.body.appendChild(this.container);
    }

    async loadPhrases() {
        // Embedded phrases for local file access (works without server)
        const embeddedPhrases = [
            { text: "איזה יופי שאתה בא.", condition: null },
            { text: "נראה אותך שם?", condition: null },
            { text: "אומרים שיהיה מעולה.", condition: null },
            { text: "תבוא לדעתי יהיה מעניין.", condition: null },
            { text: "איך קוראים לך אתה אומר?", condition: "field_empty:fullName" },
            { text: "<fullName> איזה כייף?", condition: "field_filled:fullName" },
            { text: "נעים מאוד <fullName> אני קלוד", condition: "field_filled:fullName" },
            { text: "אז בעצם מאיפה אתה בממשלה?", condition: "field_empty:organization" },
            { text: "וואו אתה מ<organization>, תגיד מכיר את...?", condition: "field_filled:organization" },
            { text: "תגיד אם אתה מ<organization> בדיוק רציתי לשאול אותך...", condition: "field_filled:organization" },
            { text: "שמעתי ה AI כבר הגיע ל<organization>", condition: "field_filled:organization" },
            { text: "אז תגיד מה אתה בעצם עושה?", condition: "field_empty:jobTitle AND field_empty:organization" },
            { text: "אז תגיד מה אתה בעצם עושה ב<organization>?", condition: "field_empty:jobTitle AND field_filled:organization" },
            { text: "תגיד איך <jobTitle> משתמש ב AI?", condition: "field_filled:jobTitle AND field_empty:organization" },
            { text: "<jobTitle> ב<organization>, וואלה מעניין.", condition: "field_filled:jobTitle AND field_filled:organization" },
            { text: "קלוד קוד אגב זה אחד הכלים הכי מתקדמים בתחום, יפה.", condition: "tool_selected:Claude Code" },
            { text: "ידעת שלג'ימיני יש קונטקסט של מליון טוקנים?", condition: "tool_selected:Gemini CLI/Code Assist" },
            { text: "אומרים שהמומחיות של Q של אמזון זה שהוא מכיר את אמזון. מעולה.", condition: "tool_selected:Amazon Q" },
            { text: "קופיילוט היה הראשון שהגיע לעולם הפיתוח.", condition: "tool_selected:CoPilot" },
            { text: "זה מעולה, אני מקווה שכבר אחרי הוובינר תמצא עוזר פיתוח.", condition: "tool_selected:לא משתמש אבל רוצה להשתמש" },
            { text: "אז אתה אומר: <otherTool>, מעניין.", condition: "tool_selected:other AND field_filled:otherTool" },
            { text: "דרך הכפתור הירוק אתה שולח אלי לוואצאפ, אבל יש לך שדות לא מלאים.", condition: "form_incomplete" },
            { text: "דרך הכפתור האדום אתה שולח אלי למייל, אבל יש לך שדות לא מלאים.", condition: "form_incomplete" },
            { text: "דרך הכפתור הירוק אתה שולח אלי לוואצאפ", condition: "form_complete" },
            { text: "דרך הכפתור האדום אתה שולח אלי למייל", condition: "form_complete" },
            { text: "כבר לחצת על הכותרת השחורה?", condition: "fireworks_never_clicked" },
            { text: "תנסה את הכותרת השחורה שוב, זה מגניב?", condition: "fireworks_clicked_once" },
            { text: "מה אתה אומר? AI מחליף אותנו? (רגע אני לא בנאדם)", condition: null },
            { text: "כבר היית בוובינר על AI?", condition: null },
            { text: "אתה יודע שהדף הזה כולו נכתב על ידי קלוד?", condition: null },
            { text: "כבר קראת מה הולך להיות בוובינר?", condition: null },
            { text: "כבר לחצת על גלגל השיניים בצד שמאל?", condition: null },
            { text: "כבר פיצצת לוגואים? קליק-כפול", condition: null }
        ];

        try {
            // Try to fetch from JSON file (works when served from web server)
            const timestamp = new Date().getTime();
            const response = await fetch(`data/inspirational-phrases.json?v=${timestamp}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.phrases = data.phrases;
            console.log(`✅ Loaded ${this.phrases.length} phrases from JSON`);
        } catch (error) {
            // Fallback to embedded phrases (works for local file access)
            console.log('📦 Using embedded phrases (local file mode)');
            this.phrases = embeddedPhrases;
        }
        
        console.log(`Total phrases available: ${this.phrases.length}`);
    }

    setupEventListeners() {
        // Track fireworks clicks
        const header = document.getElementById('header');
        if (header) {
            header.addEventListener('click', () => {
                this.fireworksClickCount++;
            });
        }
    }

    /**
     * Condition Evaluator - Clean, declarative condition checking
     * No hardcoded logic - all driven by condition strings
     */
    evaluateCondition(conditionString) {
        if (!conditionString) return true; // No condition = always available

        // Handle AND logic
        if (conditionString.includes(' AND ')) {
            const parts = conditionString.split(' AND ');
            return parts.every(part => this.evaluateCondition(part.trim()));
        }

        // Parse condition type and value
        const [type, value] = conditionString.split(':');

        switch (type) {
            case 'field_filled':
                return this.isFieldFilled(value);
            
            case 'field_empty':
                return !this.isFieldFilled(value);
            
            case 'tool_selected':
                return this.isToolSelected(value);
            
            case 'form_complete':
                return this.isFormComplete();
            
            case 'form_incomplete':
                return !this.isFormComplete();
            
            case 'fireworks_never_clicked':
                return this.fireworksClickCount === 0;
            
            case 'fireworks_clicked_once':
                return this.fireworksClickCount >= 1;
            
            default:
                console.warn(`Unknown condition type: ${type}`);
                return false;
        }
    }

    /**
     * Form State Checkers - Simple utility functions
     */
    isFieldFilled(fieldId) {
        const field = document.getElementById(fieldId);
        // Field is considered filled only if:
        // 1. It has content
        // 2. It's NOT currently focused (user is not actively typing)
        return field && 
               field.value.trim().length > 0 && 
               document.activeElement !== field;
    }

    isToolSelected(toolValue) {
        if (toolValue === 'other') {
            const otherCheckbox = document.getElementById('tool-other');
            return otherCheckbox && otherCheckbox.checked;
        }
        
        const checkboxes = document.querySelectorAll('input[name="tools"]:checked');
        return Array.from(checkboxes).some(cb => cb.value === toolValue);
    }

    isFormComplete() {
        const requiredFields = ['fullName', 'email', 'organization', 'jobTitle'];
        const allFieldsFilled = requiredFields.every(id => this.isFieldFilled(id));
        const toolSelected = document.querySelectorAll('input[name="tools"]:checked').length > 0;
        const completionFields = ['aiIs', 'beforeAi', 'futureAi'];
        const allCompletionFilled = completionFields.every(id => this.isFieldFilled(id));
        
        return allFieldsFilled && toolSelected && allCompletionFilled;
    }

    /**
     * Parameter Resolver - Replace <placeholders> with actual values
     */
    resolveParameters(text) {
        return text.replace(/<([^>]+)>/g, (match, fieldId) => {
            const field = document.getElementById(fieldId);
            return field && field.value.trim() ? field.value.trim() : match;
        });
    }

    /**
     * Phrase Selection - Smart tracking to avoid repetition
     */
    getNextPhrase() {
        // Get all available phrases (condition met)
        const availablePhrases = this.phrases
            .map((phrase, index) => ({ phrase, index }))
            .filter(({ phrase, index }) => 
                !this.usedPhraseIndices.has(index) && 
                this.evaluateCondition(phrase.condition)
            );

        // If no available phrases, reset tracking and try again
        if (availablePhrases.length === 0) {
            this.usedPhraseIndices.clear();
            return this.getNextPhrase();
        }

        // Pick random phrase from available ones
        const selected = availablePhrases[Math.floor(Math.random() * availablePhrases.length)];
        
        // Mark as used
        this.usedPhraseIndices.add(selected.index);
        
        // Resolve parameters in text
        const resolvedText = this.resolveParameters(selected.phrase.text);
        
        return { text: resolvedText };
    }

    /**
     * UI and Animation - Same as before
     */
    getRandomPosition() {
        const margin = 50;
        const formWidth = 600;
        const formMargin = 100;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const isLeftSide = Math.random() < 0.5;

        let x, y, side;

        if (viewportWidth < 900) {
            x = margin + Math.random() * (viewportWidth - 2 * margin - 300);
            y = margin + Math.random() * (viewportHeight * 0.3);
            side = 'left';
        } else {
            const formCenter = viewportWidth / 2;
            const formLeft = formCenter - formWidth / 2 - formMargin;
            const formRight = formCenter + formWidth / 2 + formMargin;

            if (isLeftSide && formLeft > 350) {
                x = margin + Math.random() * (formLeft - margin - 300);
                side = 'right';
            } else {
                x = formRight + Math.random() * (viewportWidth - formRight - margin - 300);
                side = 'left';
            }

            y = margin + Math.random() * (viewportHeight - 2 * margin - 100);
        }

        return { x, y, side };
    }

    createMessageElement(phrase) {
        const messageEl = document.createElement('div');
        messageEl.className = 'inspirational-message';
        const pos = this.getRandomPosition();
        const style = Math.random() < 0.5 ? 'round' : 'triangle';
        const bubbleFile = `bubble-${style}-point-${pos.side}.png`;
        
        const width = style === 'round' ? 320 : 400;
        const height = style === 'round' ? 320 : 230;
        const fontSize = style === 'round' ? '1.5rem' : '1.35rem';
        
        let padding;
        if (style === 'round') {
            if (pos.side === 'right') {
                padding = '40px 80px 100px 50px';
            } else {
                padding = '40px 50px 100px 80px';
            }
        } else {
            padding = '45px 85px 85px 85px';
        }

        messageEl.style.cssText = `
            position: absolute;
            left: ${pos.x}px;
            top: ${pos.y}px;
            width: ${width}px;
            height: ${height}px;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.5s ease-out;
            pointer-events: auto;
            z-index: 2;
            cursor: pointer;
            background-image: url('assets/${bubbleFile}');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: ${padding};
            box-sizing: border-box;
        `;

        const textDiv = document.createElement('div');
        textDiv.textContent = phrase.text;
        textDiv.style.cssText = `
            color: #9333ea;
            font-size: ${fontSize};
            font-weight: 400;
            text-align: center;
            direction: rtl;
            position: relative;
            z-index: 1;
            max-width: 100%;
            word-wrap: break-word;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: geometricPrecision;
        `;

        messageEl.appendChild(textDiv);
        messageEl.addEventListener('mouseenter', () => this.pauseMessage(messageEl));
        messageEl.addEventListener('mouseleave', () => this.resumeMessage(messageEl));

        return messageEl;
    }

    animateMessage(messageEl) {
        this.container.appendChild(messageEl);

        messageEl.animationData = {
            isPaused: false,
            startTime: Date.now(),
            pausedAt: null,
            pausedDuration: 0,
            animationFrame: null
        };

        setTimeout(() => {
            messageEl.style.opacity = '1';
            messageEl.style.transform = 'translateY(0)';
        }, 50);

        // Apply speed multiplier to duration (higher multiplier = faster = shorter duration)
        const baseDuration = 8000; // 8 seconds base duration (was 2.5)
        const duration = baseDuration / this.messageSpeedMultiplier;
        const floatDistance = 80; // Increased from 30px for more movement

        const animate = () => {
            const data = messageEl.animationData;

            if (data.isPaused) {
                data.animationFrame = requestAnimationFrame(animate);
                return;
            }

            const elapsed = Date.now() - data.startTime - data.pausedDuration;
            const progress = elapsed / duration;

            if (progress < 1) {
                const offsetY = Math.sin(progress * Math.PI * 2) * floatDistance;
                const offsetX = Math.cos(progress * Math.PI) * (floatDistance / 2);
                messageEl.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                data.animationFrame = requestAnimationFrame(animate);
            } else {
                this.fadeOutMessage(messageEl);
            }
        };

        messageEl.animationData.animationFrame = requestAnimationFrame(animate);
    }

    pauseMessage(messageEl) {
        if (!messageEl.animationData) return;

        const data = messageEl.animationData;
        if (!data.isPaused) {
            data.isPaused = true;
            data.pausedAt = Date.now();

            if (data.animationFrame) {
                cancelAnimationFrame(data.animationFrame);
            }

            messageEl.style.filter = 'drop-shadow(0 12px 35px rgba(147, 51, 234, 0.6))';
            const currentTransform = messageEl.style.transform;
            messageEl.style.transform = currentTransform.includes('scale')
                ? currentTransform
                : currentTransform + ' scale(1.05)';
        }
    }

    resumeMessage(messageEl) {
        if (!messageEl.animationData) return;

        const data = messageEl.animationData;
        if (data.isPaused) {
            data.pausedDuration += Date.now() - data.pausedAt;
            data.isPaused = false;

            const baseDuration = 8000; // Match the animation duration
            const duration = baseDuration / this.messageSpeedMultiplier;
            const floatDistance = 80; // Match the animation distance

            const animate = () => {
                if (data.isPaused) {
                    data.animationFrame = requestAnimationFrame(animate);
                    return;
                }

                const elapsed = Date.now() - data.startTime - data.pausedDuration;
                const progress = elapsed / duration;

                if (progress < 1) {
                    const offsetY = Math.sin(progress * Math.PI * 2) * floatDistance;
                    const offsetX = Math.cos(progress * Math.PI) * (floatDistance / 2);
                    messageEl.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                    data.animationFrame = requestAnimationFrame(animate);
                } else {
                    this.fadeOutMessage(messageEl);
                }
            };

            messageEl.style.filter = 'none';
            data.animationFrame = requestAnimationFrame(animate);
        }
    }

    fadeOutMessage(messageEl) {
        messageEl.style.transition = 'all 0.5s ease-in';
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
            const index = this.activeMessages.indexOf(messageEl);
            if (index > -1) {
                this.activeMessages.splice(index, 1);
            }
        }, 500);
    }

    showMessage() {
        console.log(`showMessage: active=${this.activeMessages.length}, max=${this.maxActiveMessages}`);
        
        if (this.activeMessages.length >= this.maxActiveMessages) {
            console.log('Blocked: max messages reached');
            return;
        }

        const phrase = this.getNextPhrase();
        const messageEl = this.createMessageElement(phrase);

        this.activeMessages.push(messageEl);
        console.log(`New message added! Now have ${this.activeMessages.length} active messages`);
        this.animateMessage(messageEl);
    }

    startMessageFlow() {
        // Initial delay before first message
        setTimeout(() => {
            this.showMessage();
        }, 1000);

        // Continuous message generator
        const showRandomMessage = () => {
            const randomDelay = 1000 + Math.random() * 1000; // 1-2 seconds (faster to fill up slots)

            setTimeout(() => {
                // Always try to show a message (it will check maxActiveMessages internally)
                this.showMessage();
                // Schedule next attempt
                showRandomMessage();
            }, randomDelay);
        };

        showRandomMessage();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.inspirationalTalk = new InspirationalTalk();
});
