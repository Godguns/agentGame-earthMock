export const MAIN_STORY_ARCS = [
  {
    key: "campus_transition",
    title: "校园转场线",
    summary: "从学生身份过渡到现实社会的主剧情。",
    match: ({ persona }) => String(persona?.archetype || "").includes("学生"),
    scenes: [
      {
        key: "intro",
        title: "离开校园的那天",
        lines: [
          { speaker: "母亲", text: "你不能一直停在那儿，现实会继续往前走。" },
          { speaker: "玩家", text: "我知道，只是还没准备好。" },
        ],
        choices: [
          { key: "study", label: "继续学习", description: "延缓进入社会，但积累能力。" },
          { key: "work", label: "直接工作", description: "迅速接触现实压力。" },
        ],
      },
    ],
  },
  {
    key: "urban_pressure",
    title: "都市打工线",
    summary: "房租、绩效、加班与关系的持续挤压。",
    match: () => true,
    scenes: [
      {
        key: "intro",
        title: "城市第一晚",
        lines: [
          { speaker: "母亲", text: "这个城市不会照顾你，得你自己学会活下去。" },
          { speaker: "玩家", text: "那我就先撑过今晚。" },
        ],
        choices: [
          { key: "rent", label: "先找住处", description: "优先解决生存问题。" },
          { key: "job", label: "先找工作", description: "优先解决现金流。" },
        ],
      },
    ],
  },
];

export function resolveMainStoryArc(persona, worldState) {
  return (
    MAIN_STORY_ARCS.find((arc) => arc.match({ persona, worldState })) ||
    MAIN_STORY_ARCS[MAIN_STORY_ARCS.length - 1]
  );
}
