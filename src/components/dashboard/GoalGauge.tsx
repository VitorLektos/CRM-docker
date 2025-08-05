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

  const data = [{ name: "goal", value: percentage, full: 100 }];

  // Color goes from red (0) -> yellow (60) -> green (120)
  const hue = (percentage / 100) * 120;
  const fillColor = `hsl(${hue}, 70%, 50%)`;

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
              innerRadius="85%"
              outerRadius="100%"
              data={data}
              startAngle={180}
              endAngle={0}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              
              {/* Background Track Bar */}
              <RadialBar
                dataKey="full"
                fill="hsl(var(--muted))"
                cornerRadius={10}
                background={false}
              />

              {/* Progress Bar */}
              <RadialBar
                dataKey="value"
                fill={fillColor}
                cornerRadius={10}
                background={false}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-semibold" style={{ color: fillColor }}>
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}