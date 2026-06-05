// Backend API configuration
// Auto-detects: uses Render URL when deployed, localhost when developing locally
const IS_LOCAL_ENV = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BACKEND_API_URL = IS_LOCAL_ENV
    ? 'http://localhost:5000'
    : 'https://csp-project-f6aq.onrender.com';

// Assessment data storage - matches backend dataset
const assessmentData = {
    location: null,
    time: null,
    injury_mechanism: null,
    pain_level: 5,
    swelling: null,
    bruising: null,
    mobility_loss: null,
    point_tenderness: 0,  // Default to No
    deformity_visible: 0,  // Default to No
    weight_bearing_possible: null
};

// X-ray data storage
const xrayData = {
    file: null,
    location: null,
    preview: null
};

let currentStep = 1;

// Scroll to assessment section
function scrollToAssessment() {
    document.getElementById('assessment').scrollIntoView({ behavior: 'smooth' });
}

// Step navigation
function goToStep(step) {
    // Validate current step before moving forward
    if (step > currentStep) {
        if (currentStep === 1 && (!assessmentData.location || !assessmentData.time || assessmentData.injury_mechanism === null || assessmentData.bruising === null)) {
            alert('Please answer all questions before proceeding.');
            return;
        }
        if (currentStep === 2 && (assessmentData.weight_bearing_possible === null || assessmentData.swelling === null || assessmentData.mobility_loss === null)) {
            alert('Please answer all questions before proceeding.');
            return;
        }
    }

    // Hide all steps
    document.getElementById('step-1').classList.add('hidden');
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-3').classList.add('hidden');

    // Show target step
    document.getElementById(`step-${step}`).classList.remove('hidden');

    // Update stepper UI
    updateStepper(step);
    currentStep = step;

    // If moving to step 3, calculate and show results
    if (step === 3) {
        calculateResult();
    }
}

// Update stepper visual state
function updateStepper(activeStep) {
    for (let i = 1; i <= 3; i++) {
        const stepCircle = document.getElementById(`stepper-${i}`);
        const stepLabel = document.getElementById(`stepper-label-${i}`);
        
        if (i === activeStep) {
            stepCircle.className = 'w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md';
            stepLabel.className = 'font-label-sm text-label-sm text-on-surface';
        } else if (i < activeStep) {
            stepCircle.className = 'w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md';
            stepLabel.className = 'font-label-sm text-label-sm text-primary';
        } else {
            stepCircle.className = 'w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-label-md text-label-md';
            stepLabel.className = 'font-label-sm text-label-sm text-on-surface-variant';
        }
    }
}

// Selection functions
function selectLocation(location) {
    assessmentData.location = location;
    document.querySelectorAll('.location-btn').forEach(btn => {
        if (btn.dataset.location === location) {
            btn.className = 'location-btn px-4 py-2 rounded-full border border-primary bg-primary/10 text-primary font-label-md text-label-md transition-colors';
        } else {
            btn.className = 'location-btn px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-colors';
        }
    });
}

function selectMechanism(type) {
    // Map user-friendly names to backend values: 0=twist, 1=fall, 2=direct hit
    const mechanismMap = {'Twist': 0, 'Fall': 1, 'Direct Hit': 2};
    assessmentData.injury_mechanism = mechanismMap[type];
    
    document.querySelectorAll('.mechanism-btn').forEach(btn => {
        if (btn.textContent === type) {
            btn.className = 'mechanism-btn px-4 py-2 rounded-full border border-primary bg-primary/10 text-primary font-label-md text-label-md transition-colors';
        } else {
            btn.className = 'mechanism-btn px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-colors';
        }
    });
}

function selectTime(time) {
    assessmentData.time = time;
    document.querySelectorAll('.time-btn').forEach(btn => {
        if (btn.textContent === time) {
            btn.className = 'time-btn px-4 py-2 rounded-full border border-primary bg-primary/10 text-primary font-label-md text-label-md transition-colors';
        } else {
            btn.className = 'time-btn px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-colors';
        }
    });
}

function selectWeight(value) {
    assessmentData.weight_bearing_possible = value === 'yes' ? 1 : 0;
}

function updatePainValue(value) {
    assessmentData.pain_level = parseInt(value);
    document.getElementById('pain-value').textContent = value;
}

function selectDeformity(checked) {
    assessmentData.deformity_visible = checked ? 1 : 0;
}

function selectSwelling(level) {
    // Map to backend values: 0=none, 1=mild, 2=severe
    const swellingMap = {'None': 0, 'Mild': 1, 'Moderate': 2, 'Severe': 2};
    assessmentData.swelling = swellingMap[level];
    
    document.querySelectorAll('.swelling-btn').forEach(btn => {
        if (btn.textContent === level) {
            btn.className = 'swelling-btn px-4 py-2 rounded-full border border-primary bg-primary/10 text-primary font-label-md text-label-md transition-colors';
        } else {
            btn.className = 'swelling-btn px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-colors';
        }
    });
}

function selectBruising(answer) {
    // Map Yes/No to backend values: 0=no, 1=yes
    assessmentData.bruising = answer === 'Yes' ? 1 : 0;
    
    document.querySelectorAll('.bruising-btn').forEach(btn => {
        if (btn.textContent === answer) {
            btn.className = 'bruising-btn px-4 py-2 rounded-full border border-primary bg-primary/10 text-primary font-label-md text-label-md transition-colors';
        } else {
            btn.className = 'bruising-btn px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-colors';
        }
    });
}

function selectMobility(level) {
    // Map to backend values: 0=normal, 1=limited, 2=cannot move
    const mobilityMap = {'Normal': 0, 'Limited': 1, 'Cannot Move': 2};
    assessmentData.mobility_loss = mobilityMap[level];
    
    document.querySelectorAll('.mobility-btn').forEach(btn => {
        if (btn.textContent === level) {
            btn.className = 'mobility-btn px-4 py-2 rounded-full border border-primary bg-primary/10 text-primary font-label-md text-label-md transition-colors';
        } else {
            btn.className = 'mobility-btn px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-colors';
        }
    });
}

function selectTenderness(checked) {
    assessmentData.point_tenderness = checked ? 1 : 0;
}

// Calculate result using backend API
async function calculateResult() {
    const resultContent = document.getElementById('result-content');
    
    // Show loading state
    resultContent.innerHTML = `
        <div class="flex flex-col items-center py-8">
            <div class="w-16 h-16 mb-4 rounded-full bg-primary-container/20 flex items-center justify-center">
                <span class="material-symbols-outlined text-4xl text-primary-container animate-spin">progress_activity</span>
            </div>
            <p class="font-body-md text-body-md text-on-surface-variant">Analyzing your symptoms...</p>
        </div>
    `;
    
    try {
        // Prepare data for backend
        const payload = {
            pain_level: assessmentData.pain_level,
            swelling: assessmentData.swelling,
            bruising: assessmentData.bruising,
            mobility_loss: assessmentData.mobility_loss,
            point_tenderness: assessmentData.point_tenderness,
            deformity_visible: assessmentData.deformity_visible,
            injury_mechanism: assessmentData.injury_mechanism,
            weight_bearing_possible: assessmentData.weight_bearing_possible
        };
        
        console.log('Sending to backend:', payload);
        
        // Call backend API
        const response = await fetch(`${BACKEND_API_URL}/api/diagnose`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Backend response:', result);
        
        // Display result
        displayResult(result);
        
    } catch (error) {
        console.error('Error calling backend:', error);
        resultContent.innerHTML = `
            <div class="bg-error-container/20 p-6 rounded-xl">
                <p class="font-body-md text-body-md text-error text-center mb-2">
                    <strong>⚠️ Unable to connect to backend server</strong>
                </p>
                <p class="font-body-sm text-body-sm text-on-surface-variant text-center">
                    Please make sure the Flask server is running on ${BACKEND_API_URL}
                </p>
                <p class="font-body-sm text-body-sm text-on-surface-variant text-center mt-2">
                    Error: ${error.message}
                </p>
            </div>
        `;
    }
}

// Display the assessment result from backend
function displayResult(result) {
    const floatingCard = document.getElementById('floating-result-card');
    const resultsSection = document.getElementById('results-section');
    const resultContent = document.getElementById('result-content');
    
    const diagnosis = result.diagnosis;
    const confidence = Math.round(result.confidence * 100);
    const recommendedAction = result.recommended_action;
    
    // Determine color scheme based on diagnosis
    const colorMap = {
        'fracture': { bg: 'tertiary-container', text: 'tertiary', icon: 'skeleton' },
        'sprain': { bg: 'secondary-container', text: 'secondary', icon: 'healing' },
        'normal': { bg: 'primary-container', text: 'primary', icon: 'check_circle' }
    };
    
    const colors = colorMap[diagnosis] || colorMap['normal'];
    
    const resultHTML = `
        <div class="p-2">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-${colors.bg}/20 flex items-center justify-center text-${colors.bg}">
                        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">${colors.icon}</span>
                    </div>
                    <div>
                        <p class="font-label-sm text-label-sm text-on-surface-variant uppercase">AI Diagnosis</p>
                        <p class="font-headline-sm text-headline-sm text-on-surface">${diagnosis.charAt(0).toUpperCase() + diagnosis.slice(1)}</p>
                    </div>
                </div>
                <div class="bg-surface-container text-on-surface px-3 py-2 rounded-lg font-label-sm text-label-sm">
                    ${confidence}% Confidence
                </div>
            </div>
            <div class="space-y-3 mb-6">
                <div class="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div class="h-full bg-${colors.text}" style="width: ${confidence}%"></div>
                </div>
                <p class="font-body-sm text-body-sm text-on-surface-variant">
                    Based on your symptoms: ${assessmentData.location} injury, pain level ${assessmentData.pain_level}/10, ${assessmentData.weight_bearing_possible ? 'able' : 'unable'} to bear weight.
                </p>
            </div>
            <div class="pt-4 border-t border-outline-variant/30">
                <p class="font-label-md text-label-md text-on-surface mb-3">Recommended Actions:</p>
                <div class="bg-surface-container-high p-4 rounded-xl">
                    <p class="font-body-sm text-body-sm text-on-surface whitespace-pre-line">${recommendedAction}</p>
                </div>
            </div>
            ${diagnosis === 'fracture' ? '<div class="mt-4 p-3 bg-error-container/20 rounded-lg"><p class="font-body-sm text-body-sm text-error text-center"><strong>⚠️ This is a medical emergency</strong> - Seek professional care immediately</p></div>' : ''}
        </div>
    `;
    
    // Display in step 3 summary
    resultContent.innerHTML = `
        <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30">
            <div class="flex items-center justify-center gap-3 mb-4">
                <span class="material-symbols-outlined text-4xl text-${colors.text}" style="font-variation-settings: 'FILL' 1;">${colors.icon}</span>
                <div>
                    <p class="font-label-sm text-label-sm text-on-surface-variant uppercase">AI Diagnosis</p>
                    <p class="font-headline-md text-headline-md text-on-surface">${diagnosis.charAt(0).toUpperCase() + diagnosis.slice(1)}</p>
                </div>
            </div>
            <div class="bg-surface-container text-on-surface px-3 py-2 rounded-lg font-label-md text-label-md text-center mb-4">
                ${confidence}% Confidence
            </div>
            <div class="bg-primary/10 px-3 py-2 rounded-lg text-center mb-4">
                <p class="font-label-sm text-label-sm text-primary">✓ Powered by ML Model (RandomForest)</p>
            </div>
            <p class="font-body-md text-body-md text-on-surface-variant text-center mb-4">
                Scroll down to see detailed recommendations
            </p>
        </div>
    `;
    
    // Display in floating card section
    floatingCard.innerHTML = resultHTML;
    resultsSection.classList.remove('hidden');
    
    // Scroll to results after a short delay
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
}

// Reset assessment
function resetAssessment() {
    assessmentData.location = null;
    assessmentData.time = null;
    assessmentData.injury_mechanism = null;
    assessmentData.pain_level = 5;
    assessmentData.swelling = null;
    assessmentData.bruising = null;
    assessmentData.mobility_loss = null;
    assessmentData.point_tenderness = 0;  // Reset to default No
    assessmentData.deformity_visible = 0;  // Reset to default No
    assessmentData.weight_bearing_possible = null;
    
    // Reset UI
    document.querySelectorAll('.location-btn, .time-btn, .mechanism-btn, .swelling-btn, .bruising-btn, .mobility-btn, .tenderness-btn').forEach(btn => {
        btn.className = btn.className.replace('border-primary bg-primary/10 text-primary', 'border-outline-variant text-on-surface-variant hover:bg-surface-container');
    });
    
    document.querySelectorAll('input[name="weight"]').forEach(input => input.checked = false);
    document.getElementById('pain-slider').value = 5;
    document.getElementById('pain-value').textContent = '5';
    document.getElementById('deformity-check').checked = false;
    document.getElementById('tenderness-check').checked = false;
    
    // Hide results section
    document.getElementById('results-section').classList.add('hidden');
    
    // Hide and reset X-ray section
    document.getElementById('xray-section').classList.add('hidden');
    removeXray();
    
    goToStep(1);
    
    // Scroll back to assessment
    setTimeout(() => {
        document.getElementById('assessment').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// X-ray functions (keeping existing implementation)
function triggerHeroXrayUpload() {
    const xraySection = document.getElementById('xray-section');
    xraySection.classList.remove('hidden');
    document.getElementById('upload-area').classList.remove('hidden');
    document.getElementById('xray-preview').classList.add('hidden');
    document.getElementById('analyzing-state').classList.add('hidden');
    
    // Scroll to the xray section
    xraySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Synchronously click the file input to ensure the file chooser opens reliably
    document.getElementById('xray-upload-main').click();
}

function handleXrayUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
    }
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/dicom'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.dcm')) {
        alert('Please upload a valid image file (JPG, PNG, or DICOM)');
        return;
    }
    
    xrayData.file = file;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        xrayData.preview = e.target.result;
        document.getElementById('xray-image').src = e.target.result;
        document.getElementById('file-name').textContent = file.name;
        document.getElementById('file-size').textContent = formatFileSize(file.size);
        
        document.getElementById('upload-area').classList.add('hidden');
        document.getElementById('xray-preview').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
    
    const xraySection = document.getElementById('xray-section');
    xraySection.classList.remove('hidden');
    setTimeout(() => {
        xraySection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function removeXray() {
    xrayData.file = null;
    xrayData.location = null;
    xrayData.preview = null;
    
    document.getElementById('xray-upload-main').value = '';
    document.getElementById('upload-area').classList.remove('hidden');
    document.getElementById('xray-preview').classList.add('hidden');
    
    document.querySelectorAll('.xray-location-btn').forEach(btn => {
        btn.className = 'xray-location-btn px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-colors';
    });
}

function selectXrayLocation(location) {
    xrayData.location = location;
    document.querySelectorAll('.xray-location-btn').forEach(btn => {
        if (btn.textContent === location) {
            btn.className = 'xray-location-btn px-4 py-2 rounded-full border border-primary bg-primary/10 text-primary font-label-md text-label-md transition-colors';
        } else {
            btn.className = 'xray-location-btn px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-colors';
        }
    });
}

async function analyzeXray() {
    if (!xrayData.location) {
        alert('Please select which area was X-rayed');
        return;
    }
    if (!xrayData.file) {
        alert('Please upload an X-ray image first');
        return;
    }
    
    document.getElementById('xray-preview').classList.add('hidden');
    document.getElementById('analyzing-state').classList.remove('hidden');
    
    try {
        const formData = new FormData();
        formData.append('file', xrayData.file);
        formData.append('location', xrayData.location);
        
        const response = await fetch(`${BACKEND_API_URL}/api/predict-xray`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const detailedMsg = errorData.details ? `${errorData.error} (${errorData.details})` : (errorData.error || `Server responded with status ${response.status}`);
            throw new Error(detailedMsg);
        }
        
        const result = await response.json();
        console.log('X-ray API response:', result);
        displayXrayResult(result);
    } catch (error) {
        console.error('Error analyzing X-ray:', error);
        alert(`Failed to analyze X-ray: ${error.message}`);
    } finally {
        document.getElementById('analyzing-state').classList.add('hidden');
        document.getElementById('xray-preview').classList.remove('hidden');
    }
}

function displayXrayResult(result) {
    const floatingCard = document.getElementById('floating-result-card');
    const resultsSection = document.getElementById('results-section');
    
    const diagnosis = result.diagnosis;
    const confidence = Math.round(result.confidence * 100);
    
    const colorMap = {
        'fracture': { bg: 'tertiary-container', text: 'tertiary', icon: 'warning' },
        'normal': { bg: 'primary-container', text: 'primary', icon: 'check_circle' }
    };
    
    const colors = colorMap[diagnosis];
    
    const resultHTML = `
        <div class="p-2">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-${colors.bg}/20 flex items-center justify-center text-${colors.bg}">
                        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">radiology</span>
                    </div>
                    <div>
                        <p class="font-label-sm text-label-sm text-on-surface-variant uppercase">X-Ray Analysis</p>
                        <p class="font-headline-sm text-headline-sm text-on-surface">${diagnosis === 'fracture' ? 'Fracture Detected' : 'No Fracture Detected'}</p>
                    </div>
                </div>
                <div class="bg-surface-container text-on-surface px-3 py-2 rounded-lg font-label-sm text-label-sm">
                    ${confidence}% Confidence
                </div>
            </div>
            <div class="space-y-3 mb-6">
                <div class="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div class="h-full bg-${colors.text}" style="width: ${confidence}%"></div>
                </div>
                <div class="flex justify-center mb-4">
                    <img src="${xrayData.preview}" alt="X-ray" class="max-w-xs rounded-lg border border-outline-variant"/>
                </div>
                <p class="font-body-sm text-body-sm text-on-surface-variant">
                    AI analysis of ${xrayData.location} X-ray image.
                </p>
            </div>
            <div class="pt-4 border-t border-outline-variant/30">
                <p class="font-label-md text-label-md text-on-surface mb-3">Recommended Actions:</p>
                <div class="bg-surface-container-high p-4 rounded-xl">
                    <p class="font-body-sm text-body-sm text-on-surface">${result.recommended_action}</p>
                </div>
            </div>
            <div class="mt-4 p-3 bg-primary-container/10 rounded-lg">
                <p class="font-body-sm text-body-sm text-on-surface-variant text-center">
                    <span class="material-symbols-outlined text-[16px] align-middle">info</span>
                    This is an AI preliminary analysis. Always consult a radiologist for official diagnosis.
                </p>
            </div>
            ${diagnosis === 'fracture' ? '<div class="mt-4 p-3 bg-error-container/20 rounded-lg"><p class="font-body-sm text-body-sm text-error text-center"><strong>⚠️ Seek immediate medical attention</strong></p></div>' : ''}
            <div class="mt-6 flex justify-center">
                <button onclick="resetXrayAnalysis()" class="border border-outline-variant text-on-surface px-8 py-3 rounded-xl font-label-md text-label-md hover:bg-surface-container transition-all flex items-center gap-2">
                    <span class="material-symbols-outlined">restart_alt</span> Upload Another X-Ray
                </button>
            </div>
        </div>
    `;
    
    floatingCard.innerHTML = resultHTML;
    resultsSection.classList.remove('hidden');
    
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
}

function resetXrayAnalysis() {
    removeXray();
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('xray-section').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('xray-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

// Animation code
document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.reveal').forEach((el) => {
            revealObserver.observe(el);
        });

        const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

        const animateValue = (obj, start, end, duration) => {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const currentVal = Math.floor(start + (end - start) * easeOutExpo(progress));
                obj.innerHTML = currentVal;
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    const container = obj.closest('.stat-number-container');
                    if(container) {
                        container.classList.add('stat-bounce');
                    }
                }
            };
            window.requestAnimationFrame(step);
        }

        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const container = entry.target;
                    
                    const numElements = container.querySelectorAll('.stat-number');
                    numElements.forEach(el => {
                        const targetParent = el.closest('[data-target]');
                        if(targetParent) {
                             const targetVal = parseInt(targetParent.getAttribute('data-target'), 10);
                             if(!isNaN(targetVal)) {
                                 animateValue(el, 0, targetVal, 1200);
                             }
                        }
                    });

                    const progressBars = container.querySelectorAll('.progress-bar');
                    progressBars.forEach(bar => {
                        const targetWidth = bar.getAttribute('data-target');
                        if(targetWidth) {
                            setTimeout(() => {
                                bar.style.width = targetWidth;
                            }, 50);
                        }
                    });

                    observer.unobserve(container);
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.card-stat-container').forEach((el) => {
            statsObserver.observe(el);
        });
    } else {
        document.querySelectorAll('.reveal').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        document.querySelectorAll('.progress-bar').forEach(bar => {
            bar.style.width = bar.getAttribute('data-target');
        });
        document.querySelectorAll('.stat-number').forEach(num => {
             const targetParent = num.closest('[data-target]');
             if(targetParent) {
                 num.innerHTML = targetParent.getAttribute('data-target');
             }
        });
    }

    // Dynamic navigation active states (ScrollSpy)
    const navLinks = document.querySelectorAll('#navbar-links a[href^="#"]');
    const sections = Array.from(navLinks).map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);

    const activeClasses = ['text-primary', 'dark:text-primary-fixed', 'border-b-2', 'border-primary', 'pb-1'];
    const inactiveClasses = ['text-on-surface-variant', 'dark:text-on-surface-variant', 'hover:text-primary', 'dark:hover:text-primary-fixed', 'transition-colors'];

    function setActiveLink(activeLink) {
        navLinks.forEach(link => {
            if (link === activeLink) {
                link.classList.remove(...inactiveClasses);
                link.classList.add(...activeClasses);
            } else {
                link.classList.remove(...activeClasses);
                link.classList.add(...inactiveClasses);
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            setActiveLink(link);
        });
    });

    if (sections.length > 0 && 'IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '-30% 0px -50% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    const matchingLink = document.querySelector(`#navbar-links a[href="#${id}"]`);
                    if (matchingLink) {
                        setActiveLink(matchingLink);
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }
});
