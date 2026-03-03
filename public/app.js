/**
 * CLAIRVEX M13 — Frontend Application
 * Visualisation des analyses de risques EBIOS RM
 */

(function () {
  'use strict';

  const API_BASE = window.location.origin;

  // DOM Elements
  const formSection = document.getElementById('form-section');
  const loadingSection = document.getElementById('loading-section');
  const resultsSection = document.getElementById('results-section');
  const errorSection = document.getElementById('error-section');
  const riskForm = document.getElementById('risk-form');
  const submitBtn = document.getElementById('submit-btn');

  // ==========================================
  // FORM SUBMISSION
  // ==========================================

  riskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      organisation: document.getElementById('organisation').value.trim(),
      descriptionSysteme: document.getElementById('descriptionSysteme').value.trim(),
      secteurActivite: document.getElementById('secteurActivite').value,
    };

    const contexte = document.getElementById('contexteMetier').value.trim();
    if (contexte) payload.contexteMetier = contexte;

    const contraintes = document.getElementById('contraintesReglementaires').value.trim();
    if (contraintes) {
      payload.contraintesReglementaires = contraintes.split(',').map(s => s.trim()).filter(Boolean);
    }

    const enjeux = document.getElementById('enjeuxMetier').value.trim();
    if (enjeux) {
      payload.enjeuxMetier = enjeux.split(',').map(s => s.trim()).filter(Boolean);
    }

    showSection('loading');
    animateLoadingSteps();

    try {
      const response = await fetch(`${API_BASE}/risk-assessment/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      renderResults(data);
      showSection('results');
    } catch (err) {
      document.getElementById('error-message').textContent = err.message;
      showSection('error');
    }
  });

  // New analysis / retry
  document.getElementById('new-analysis-btn').addEventListener('click', () => showSection('form'));
  document.getElementById('retry-btn').addEventListener('click', () => showSection('form'));

  // ==========================================
  // SECTION MANAGEMENT
  // ==========================================

  function showSection(name) {
    formSection.classList.toggle('hidden', name !== 'form');
    loadingSection.classList.toggle('hidden', name !== 'loading');
    resultsSection.classList.toggle('hidden', name !== 'results');
    errorSection.classList.toggle('hidden', name !== 'error');

    submitBtn.querySelector('.btn-text').classList.toggle('hidden', name === 'loading');
    submitBtn.querySelector('.btn-loader').classList.toggle('hidden', name !== 'loading');
    submitBtn.disabled = name === 'loading';
  }

  // ==========================================
  // LOADING ANIMATION
  // ==========================================

  let loadingInterval;

  function animateLoadingSteps() {
    const steps = document.querySelectorAll('.loading-step');
    steps.forEach(s => { s.classList.remove('active', 'done'); });

    let current = 0;
    if (loadingInterval) clearInterval(loadingInterval);

    steps[0].classList.add('active');
    loadingInterval = setInterval(() => {
      if (current < steps.length) {
        steps[current].classList.remove('active');
        steps[current].classList.add('done');
      }
      current++;
      if (current < steps.length) {
        steps[current].classList.add('active');
      } else {
        clearInterval(loadingInterval);
      }
    }, 3000);
  }

  // ==========================================
  // TABS
  // ==========================================

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
  });

  // ==========================================
  // RENDER RESULTS
  // ==========================================

  function renderResults(data) {
    if (loadingInterval) clearInterval(loadingInterval);

    // Header
    document.getElementById('result-org').textContent = data.organisation;
    document.getElementById('result-meta').textContent =
      `ID: ${data.id} | ${data.methodologie} | ${new Date(data.generatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;

    // Risk level badge
    const riskBadge = document.getElementById('risk-level-badge');
    const riskLabels = { 1: 'Faible', 2: 'Modéré', 3: 'Élevé', 4: 'Critique' };
    riskBadge.textContent = `Risque Global: ${riskLabels[data.niveauRisqueGlobal] || data.niveauRisqueGlobal}`;
    riskBadge.className = `risk-level-badge risk-level-${data.niveauRisqueGlobal}`;

    // Recommendations
    const recoList = document.getElementById('reco-list');
    recoList.innerHTML = (data.recommandationsPrioritaires || [])
      .map(r => `<li>${escapeHtml(r)}</li>`).join('');

    // Ateliers
    renderAtelier1(data.ateliers.atelier1);
    renderAtelier2(data.ateliers.atelier2);
    renderAtelier3(data.ateliers.atelier3);
    renderAtelier4(data.ateliers.atelier4);
    renderAtelier5(data.ateliers.atelier5);

    // Reset to first tab
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector('.tab[data-tab="atelier1"]').classList.add('active');
    document.getElementById('tab-atelier1').classList.add('active');
  }

  // ==========================================
  // ATELIER 1 — Cadrage
  // ==========================================

  function renderAtelier1(a1) {
    document.getElementById('a1-perimetre').textContent = a1.perimetre || '';

    // Valeurs métier
    const valeursHtml = (a1.valeursMetier || []).map(v => `
      <div class="valeur-card">
        <h5>${escapeHtml(v.nom)}</h5>
        <p>${escapeHtml(v.description)}</p>
        <div class="cidt-bars">
          ${renderCIDTItem('C', v.confidentialite)}
          ${renderCIDTItem('I', v.integrite)}
          ${renderCIDTItem('D', v.disponibilite)}
          ${renderCIDTItem('T', v.tracabilite)}
        </div>
      </div>
    `).join('');
    document.getElementById('a1-valeurs').innerHTML = valeursHtml;

    // Événements redoutés
    const evtsHtml = `
      <table>
        <thead><tr><th>ID</th><th>Description</th><th>Valeur impactée</th><th>Critère</th><th>Impact</th></tr></thead>
        <tbody>
          ${(a1.evenementsRedoutes || []).map(e => `
            <tr>
              <td>${escapeHtml(e.id)}</td>
              <td>${escapeHtml(e.description)}</td>
              <td>${escapeHtml(e.valeurMetierImpactee)}</td>
              <td>${escapeHtml(e.critereAffecte)}</td>
              <td>${renderLevelDots(e.niveauImpact)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    document.getElementById('a1-evenements').innerHTML = evtsHtml;

    // Socle sécurité
    const key = a1.socleSécurité || a1.socleSecurite || [];
    document.getElementById('a1-socle').innerHTML =
      key.map(s => `<li>${escapeHtml(s)}</li>`).join('');
  }

  function renderCIDTItem(label, level) {
    return `
      <div class="cidt-item">
        <span class="cidt-label">${label}</span>
        <div class="cidt-bar"><div class="cidt-fill" data-level="${level}"></div></div>
        <span class="cidt-value">${level}/4</span>
      </div>
    `;
  }

  // ==========================================
  // ATELIER 2 — Sources de Risque
  // ==========================================

  function renderAtelier2(a2) {
    // Sources
    document.getElementById('a2-sources').innerHTML = (a2.sourcesRisque || []).map(s => `
      <div class="source-card" data-cat="${escapeHtml(s.categorie)}">
        <div class="source-header">
          <h5>${escapeHtml(s.nom)}</h5>
          <span class="source-cat" data-cat="${escapeHtml(s.categorie)}">${escapeHtml(s.categorie)}</span>
        </div>
        <p class="source-meta">${escapeHtml(s.motivation)}</p>
        <div class="source-levels">
          <span>Ressources: ${renderLevelDots(s.niveauRessources)}</span>
          <span>Activité: ${renderLevelDots(s.niveauActivite)}</span>
        </div>
      </div>
    `).join('');

    // Objectifs
    document.getElementById('a2-objectifs').innerHTML = (a2.objectifsVises || []).map(o => `
      <div class="objectif-item">
        <strong>${escapeHtml(o.id)}</strong> — ${escapeHtml(o.description)}
        <div class="obj-target">Cible: ${escapeHtml(o.valeurMetierCiblee)}</div>
      </div>
    `).join('');

    // Couples SR/OV
    document.getElementById('a2-couples').innerHTML = `
      <table>
        <thead><tr><th>ID</th><th>Source</th><th>Objectif</th><th>Pertinence</th></tr></thead>
        <tbody>
          ${(a2.couplesSROV || []).map(c => `
            <tr>
              <td>${escapeHtml(c.id)}</td>
              <td>${escapeHtml(c.sourceRisque?.nom || '')}</td>
              <td>${escapeHtml(c.objectifVise?.description || '')}</td>
              <td>${renderLevelDots(c.pertinence)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // ==========================================
  // ATELIER 3 — Scénarios Stratégiques
  // ==========================================

  function renderAtelier3(a3) {
    // Risk matrix
    renderRiskMatrix(a3.cartographieRisques, a3.scenariosStrategiques);

    // Scenarios
    document.getElementById('a3-scenarios').innerHTML = (a3.scenariosStrategiques || []).map(s => {
      const riskClass = getRiskClass(s.risqueBrut);
      return `
        <div class="scenario-card">
          <div class="scenario-header">
            <h5>${escapeHtml(s.id)} — ${escapeHtml(s.intitule)}</h5>
            <span class="risk-tag ${riskClass}">Risque: ${s.risqueBrut}</span>
          </div>
          <div class="scenario-metrics">
            <span>Vraisemblance: <strong>${s.vraisemblance}/4</strong></span>
            <span>Impact: <strong>${s.impact}/4</strong></span>
          </div>
          <div class="attack-path">
            ${(s.cheminAttaque || []).map((step, i, arr) => `
              <div class="attack-step">
                <span class="attack-step-num">${step.etape}</span>
                <span class="attack-step-text">${escapeHtml(step.description)}</span>
              </div>
              ${i < arr.length - 1 ? '<span class="attack-arrow">&#8594;</span>' : ''}
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderRiskMatrix(carto, scenarios) {
    if (!carto || !carto.matrice) {
      document.getElementById('a3-matrice').innerHTML = '<p class="text-muted">Matrice non disponible</p>';
      return;
    }

    const matrice = carto.matrice;
    // Build a count grid: how many scenarios at each (vraisemblance, impact)
    const counts = Array.from({ length: 4 }, () => Array(4).fill(0));
    (scenarios || []).forEach(s => {
      const v = (s.vraisemblance || 1) - 1;
      const imp = (s.impact || 1) - 1;
      if (v >= 0 && v < 4 && imp >= 0 && imp < 4) counts[v][imp]++;
    });

    let html = '<div class="matrice-wrapper"><div class="matrice-label-y">Vraisemblance</div><div class="matrice-grid">';

    // Rows from top (4=Maximal) to bottom (1=Minime)
    const vLabels = ['Minime', 'Significatif', 'Fort', 'Maximal'];
    const iLabels = ['Négligeable', 'Limité', 'Important', 'Critique'];

    for (let v = 3; v >= 0; v--) {
      html += `<div class="matrice-axis">${vLabels[v]}</div>`;
      for (let i = 0; i < 4; i++) {
        const risk = (v + 1) * (i + 1);
        const cellClass = risk >= 12 ? 'risk-critical' : risk >= 8 ? 'risk-high' : risk >= 4 ? 'risk-moderate' : 'risk-low';
        const count = counts[v][i];
        html += `<div class="matrice-cell ${cellClass}" title="V${v + 1} x I${i + 1} = ${risk}">
          ${count > 0 ? `<span class="cell-count">${count}</span>` : risk}
        </div>`;
      }
    }

    // Bottom axis
    html += '<div></div>';
    for (let i = 0; i < 4; i++) {
      html += `<div class="matrice-axis">${iLabels[i]}</div>`;
    }

    html += '</div><div class="matrice-label-x">Impact</div></div>';
    document.getElementById('a3-matrice').innerHTML = html;
  }

  // ==========================================
  // ATELIER 4 — Scénarios Opérationnels
  // ==========================================

  function renderAtelier4(a4) {
    // Synthèse
    const synth = a4.syntheseMesures || {};
    let synthHtml = `<div class="synthese-item"><div class="synth-value">${synth.totalMesures || 0}</div><div class="synth-label">Total mesures</div></div>`;
    if (synth.repartitionParType) {
      Object.entries(synth.repartitionParType).forEach(([type, count]) => {
        synthHtml += `<div class="synthese-item"><div class="synth-value">${count}</div><div class="synth-label">${escapeHtml(type)}</div></div>`;
      });
    }
    document.getElementById('a4-synthese').innerHTML = synthHtml;

    // Scénarios
    document.getElementById('a4-scenarios').innerHTML = (a4.scenariosOperationnels || []).map(s => {
      const riskClass = getRiskClass(s.risqueResiduel);
      return `
        <div class="scenario-card">
          <div class="scenario-header">
            <h5>${escapeHtml(s.id)} — ${escapeHtml(s.intitule)}</h5>
            <span class="risk-tag ${riskClass}">Résiduel: ${s.risqueResiduel}</span>
          </div>
          <div class="scenario-metrics">
            <span>Vraisemblance résid.: <strong>${s.vraisemblanceResiduelle}/4</strong></span>
            <span>Impact résid.: <strong>${s.impactResiduel}/4</strong></span>
          </div>
          <div style="margin-bottom: 0.75rem;">
            ${(s.techniquesATTACK || []).map(t => `
              <span class="technique-tag"><span class="tech-id">${escapeHtml(t.id)}</span> ${escapeHtml(t.nom)}</span>
            `).join('')}
          </div>
          <div>
            ${(s.mesuresSecurite || []).map(m => `
              <div class="mesure-item">
                <div>
                  <span class="mesure-type" data-type="${escapeHtml(m.type)}">${escapeHtml(m.type)}</span>
                  ${escapeHtml(m.intitule)}
                </div>
                <div class="mesure-meta">
                  <span>Eff. ${m.efficacite}/4</span>
                  <span>${escapeHtml(m.cout)}</span>
                  <span>${escapeHtml(m.delai)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================
  // ATELIER 5 — Plan de Traitement
  // ==========================================

  function renderAtelier5(a5) {
    document.getElementById('a5-synthese').textContent = a5.synthese || '';

    // Plan 3 ans
    document.getElementById('a5-plan').innerHTML = (a5.planSecurite3Ans || []).map(year => `
      <div class="plan-year">
        <div class="plan-year-header">
          <h5>Année ${year.annee}</h5>
          <span class="plan-year-budget">${escapeHtml(year.budgetEstime)}</span>
        </div>
        <div class="plan-year-body">
          <h6>Objectifs</h6>
          <ul>
            ${(year.objectifs || []).map(o => `<li>${escapeHtml(o)}</li>`).join('')}
          </ul>
          <h6>Actions (${(year.actions || []).length})</h6>
          <ul>
            ${(year.actions || []).map(a => `<li>${escapeHtml(a.intitule)}</li>`).join('')}
          </ul>
        </div>
      </div>
    `).join('');

    // Actions table
    document.getElementById('a5-actions').innerHTML = `
      <table>
        <thead><tr><th>ID</th><th>Action</th><th>Option</th><th>Priorité</th><th>Délai</th><th>Coût</th><th>Responsable</th></tr></thead>
        <tbody>
          ${(a5.actionsTraitement || []).map(a => `
            <tr>
              <td>${escapeHtml(a.id)}</td>
              <td>${escapeHtml(a.intitule)}</td>
              <td><span class="mesure-type" data-type="${getOptionTypeClass(a.option)}">${escapeHtml(a.option)}</span></td>
              <td>${renderPriority(a.priorite)}</td>
              <td>${escapeHtml(a.delai)}</td>
              <td>${escapeHtml(a.coutEstime)}</td>
              <td>${escapeHtml(a.responsable)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Risques acceptés & transférés
    document.getElementById('a5-acceptes').innerHTML =
      (a5.risquesAcceptes || []).map(r => `<li>${escapeHtml(r)}</li>`).join('') || '<li class="text-muted">Aucun</li>';
    document.getElementById('a5-transferes').innerHTML =
      (a5.risquesTransferes || []).map(r => `<li>${escapeHtml(r)}</li>`).join('') || '<li class="text-muted">Aucun</li>';
  }

  // ==========================================
  // HELPERS
  // ==========================================

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderLevelDots(level) {
    const l = Math.min(Math.max(level || 0, 0), 4);
    let html = '<span class="level-dots">';
    for (let i = 1; i <= 4; i++) {
      html += `<span class="level-dot${i <= l ? ' filled' : ''}"></span>`;
    }
    html += '</span>';
    return html;
  }

  function getRiskClass(score) {
    if (score >= 12) return 'critical';
    if (score >= 8) return 'high';
    if (score >= 4) return 'moderate';
    return 'low';
  }

  function renderPriority(p) {
    const labels = { 1: 'Haute', 2: 'Moyenne', 3: 'Basse', 4: 'Faible' };
    const colors = { 1: 'var(--danger)', 2: 'var(--risk-3)', 3: 'var(--warning)', 4: 'var(--success)' };
    return `<span style="color: ${colors[p] || 'inherit'}; font-weight: 600;">${labels[p] || p}</span>`;
  }

  function getOptionTypeClass(option) {
    const map = { 'Réduire': 'Préventive', 'Transférer': 'Détective', 'Éviter': 'Corrective', 'Accepter': 'Dissuasive' };
    return map[option] || 'Préventive';
  }

})();
