"use client";

import * as React from "react";
import { RadialBar, RadialBarChart, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface GoalGaugeProps {
  value: number;
  goal: number;
}

export function GoalGauge({ value, goal }: GoalGaugeProps) {
  const percentage = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formattedGoal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal);

  const data = [{ name: "goal", value: percentage }];

  // Color for the text, matching the approximate color at the end of the progress
  const hue = (percentage / 100) * 120;
  const textColor = `hsl(${hue}, 70%, 50%)`;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Termômetro de Metas</CardTitle>
        <CardDescription>
          Alcançado: {formattedValue} de {formattedGoal}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <div className="w-full h-56 relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              data={data}
              startAngle={180}
              endAngle={0}
            >
              <defs>
                <linearGradient id="goalGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" /> {/* Red */}
                  <stop offset="50%" stopColor="#f59e0b" /> {/* Amber */}
                  <stop offset="100%" stopColor="#22c55e" /> {/* Green */}
                </linearGradient>
              </defs>
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              
              <RadialBar
                background={{ fill: 'hsl(var(--muted))' }}
                dataKey="value"
                angleAxisId={0}
                fill="url(#goalGradient)"
                cornerRadius={10}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold" style={{ color: textColor }}>
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}