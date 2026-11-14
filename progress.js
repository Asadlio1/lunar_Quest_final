/* progress.js – all localStorage access lives here. Safe if storage is blocked. */
const LQProgress = (() => {
  const KEY = "lunarQuest.progress.v1";
  const fresh = () => ({ explored: {}, quiz: {}, modules: {}, challenges: {} });
  let state = fresh();
  try { const raw = localStorage.getItem(KEY); if (raw) state = Object.assign(fresh(), JSON.parse(raw)); } catch (e) { /* use defaults */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } };
  return {
    markExplored(id) { state.explored[id] = true; save(); },
    recordQuiz(id, correct) { state.quiz[id] = state.quiz[id] === true ? true : correct; save(); },
    isExplored: id => !!state.explored[id],
    quizResult: id => state.quiz[id],
    /* Modules keep the best score; challenges keep the best points (0-2). */
    recordModule(id, correct, total) { const o = state.modules[id]; if (!o || correct > o.correct) state.modules[id] = { correct, total }; save(); },
    moduleResult: id => state.modules[id],
    recordChallenge(id, pts) { if (!(id in state.challenges) || pts > state.challenges[id]) state.challenges[id] = pts; save(); },
    challengeResult: id => state.challenges[id],
    /* Readiness = average of four areas, each 0-1: objects explored, object checks, modules done, challenge points. */
    summary(c) {
      const explored = Object.keys(state.explored).length;
      const correct = Object.values(state.quiz).filter(v => v === true).length;
      const mods = Object.keys(state.modules).length;
      const chal = Object.keys(state.challenges).length;
      const chalPts = Object.values(state.challenges).reduce((a, b) => a + b, 0);
      const ratio = (a, b) => b ? a / b : 0;
      const readiness = Math.round(25 * (ratio(explored, c.objects) + ratio(correct, c.objects) + ratio(mods, c.modules) + ratio(chalPts, c.challenges * 2)));
      return { explored, correct, mods, chal, chalPts, readiness };
    },
    reset() { state = fresh(); save(); }
  };
})();
