import type { Metadata } from "next";
import { AgentJsonGenerator } from "./generator-client";

export const metadata: Metadata = {
  title: "agent.json 生成ツール (A2A Agent Card)",
  description:
    "A2A（Agent-to-Agent）プロトコル対応のagent.jsonを自動生成。AIエージェント同士が連携するための名刺ファイル。",
};

export default function AgentJsonPage() {
  return (
    <div className="py-16">
      <h1 className="mb-2 text-3xl font-bold text-white">
        agent.json 生成ツール
      </h1>
      <p className="mb-8 text-white/50">
        A2A Agent Card（AIエージェント名刺）をフォーム入力で自動生成。
        /.well-known/agent.json に配置してください。
      </p>
      <AgentJsonGenerator />
    </div>
  );
}
