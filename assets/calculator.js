/* calculator.js — creatorratecalc.com   (RED verdict — measured demand 540/mo; park unless a fleet slot is free)
 * Tools: "sponsorRate" (price range for a sponsored post) and "ugcRate" (UGC video package price).
 *
 * NO MARKET-RATE FIGURES ARE CLAIMED. CPM and per-video defaults are illustrative starting assumptions the
 * user edits — the UI labels them "your assumption". Any "average rate" statistic added to content must
 * cite a named, dated survey or dataset; do not quote rates from other calculator sites (they recycle each
 * other's numbers).
 */
(function (root, factory) {
  const C = factory();
  if (typeof module === 'object' && module.exports) module.exports = C; else root.CALCS = C;
})(typeof self !== 'undefined' ? self : this, function () {
  const r2 = n => Math.round(n * 100) / 100;

  const sponsorRate = {
    title: 'Sponsorship rate calculator',
    inputs: [
      { id: 'platform', label: 'Platform', type: 'select', default: 'youtube', options: [
        { value: 'youtube', label: 'YouTube integration' }, { value: 'tiktok', label: 'TikTok video' }, { value: 'instagram', label: 'Instagram Reel' }, { value: 'podcast', label: 'Podcast read' }, { value: 'newsletter', label: 'Newsletter placement' }] },
      { id: 'views', label: 'Average views per post (last 10 posts)', type: 'number', default: 50000, min: 0, help: 'Use the median, not your best post.' },
      { id: 'cpmLow', label: 'Low CPM (your assumption)', type: 'number', prefix: '$', default: 20, min: 0, help: 'CPM = price per 1,000 views.' },
      { id: 'cpmHigh', label: 'High CPM (your assumption)', type: 'number', prefix: '$', default: 40, min: 0 },
      { id: 'deliverables', label: 'Number of posts in the deal', type: 'number', default: 2, min: 1 },
      { id: 'usage', label: 'Paid usage rights uplift', type: 'number', suffix: '%', default: 20, min: 0, help: 'If the brand runs your content as ads.' },
      { id: 'exclusivity', label: 'Exclusivity uplift', type: 'number', suffix: '%', default: 0, min: 0, help: 'If you can’t work with competitors for a period.' },
    ],
    compute(v, fmt) {
      const mult = (v.deliverables || 1) * (1 + (v.usage || 0) / 100) * (1 + (v.exclusivity || 0) / 100);
      const low = (v.views || 0) * (v.cpmLow || 0) / 1000 * mult;
      const high = (v.views || 0) * (v.cpmHigh || 0) / 1000 * mult;
      return {
        raw: { low: r2(low), high: r2(high), perPostLow: r2(low / (v.deliverables || 1)) },
        warnings: (v.cpmHigh || 0) < (v.cpmLow || 0) ? ['High CPM is lower than low CPM.'] : [],
        summary: [
          { label: 'Quote range for the deal', value: `${fmt.money0(low)} – ${fmt.money0(high)}`, strong: true },
          { label: 'Per post', value: `${fmt.money0(low / (v.deliverables || 1))} – ${fmt.money0(high / (v.deliverables || 1))}` },
        ],
        notes: ['Based on your own views and CPM assumptions — not market data. Niche, audience location and engagement move real rates a lot.'],
      };
    },
  };

  const ugcRate = {
    title: 'UGC rate calculator',
    inputs: [
      { id: 'videos', label: 'Videos in the package', type: 'number', default: 3, min: 1 },
      { id: 'perVideo', label: 'Base price per video (your assumption)', type: 'number', prefix: '$', default: 150, min: 0 },
      { id: 'hooks', label: 'Extra hook variations per video', type: 'number', default: 2, min: 0 },
      { id: 'hookPrice', label: 'Price per extra hook', type: 'number', prefix: '$', default: 25, min: 0 },
      { id: 'rawFootage', label: 'Raw footage included', type: 'number', prefix: '$', default: 50, min: 0 },
      { id: 'usageMonths', label: 'Paid usage months', type: 'number', default: 3, min: 0 },
      { id: 'usagePctPerMonth', label: 'Usage fee per month (% of base)', type: 'number', suffix: '%', default: 10, min: 0 },
    ],
    compute(v, fmt) {
      const base = (v.videos || 0) * (v.perVideo || 0);
      const hooks = (v.videos || 0) * (v.hooks || 0) * (v.hookPrice || 0);
      const usage = base * (v.usagePctPerMonth || 0) / 100 * (v.usageMonths || 0);
      const total = base + hooks + (v.rawFootage || 0) + usage;
      return {
        raw: { base, hooks, usage: r2(usage), total: r2(total) },
        summary: [{ label: 'Package price', value: fmt.money0(total), strong: true }, { label: 'Per video', value: fmt.money0(total / (v.videos || 1)) }],
        rows: [{ label: 'Videos', value: fmt.money0(base) }, { label: 'Hook variations', value: fmt.money0(hooks) }, { label: 'Raw footage', value: fmt.money0(v.rawFootage || 0) }, { label: 'Usage rights', value: fmt.money0(usage) }, { label: 'Total', value: fmt.money0(total), total: true }],
      };
    },
  };

  return {
    sponsorRate, ugcRate,
    __tests: [
      { calc: 'sponsorRate', name: '50k views, $20–40 CPM, 2 posts, +20% usage', input: { views: 50000, cpmLow: 20, cpmHigh: 40, deliverables: 2, usage: 20, exclusivity: 0 }, expect: { low: 2400, high: 4800, perPostLow: 1200 } },
      { calc: 'sponsorRate', name: 'exclusivity stacks multiplicatively', input: { views: 10000, cpmLow: 25, cpmHigh: 25, deliverables: 1, usage: 0, exclusivity: 50 }, expect: { low: 375 } },
      { calc: 'ugcRate', name: '3 videos × $150 + 6 hooks × $25 + $50 raw + 3 months × 10%', input: { videos: 3, perVideo: 150, hooks: 2, hookPrice: 25, rawFootage: 50, usageMonths: 3, usagePctPerMonth: 10 }, expect: { base: 450, hooks: 150, usage: 135, total: 785 } },
    ],
  };
});
