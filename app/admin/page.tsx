"use client";

import { Card, Metric, Text, Title, BarList, Flex, Grid } from "@tremor/react";
import { Icon, ArrowUp, ArrowDown, Users, ShoppingCart, Activity } from "lucide-react";

// Mock data for the dashboard
const salesData = [
  { name: "Online Sales", value: 1230 },
  { name: "In-Store Sales", value: 751 },
  { name: "Returns", value: 210 },
];

const trafficData = [
  { name: "Organic Search", value: 4532 },
  { name: "Direct", value: 2345 },
  { name: "Referral", value: 1234 },
];

const metrics = [
  {
    title: "Total Sales",
    value: "$12,345",
    icon: ShoppingCart,
    change: "+12.5%",
    changeType: "positive",
  },
  {
    title: "Active Users",
    value: "1,234",
    icon: Users,
    change: "+3.2%",
    changeType: "positive",
  },
  {
    title: "Website Traffic",
    value: "45,678",
    icon: Activity,
    change: "-5.1%",
    changeType: "negative",
  },
];

export default function AdminDashboard() {
  return (
    <main className="p-6 bg-gray-900 min-h-screen text-white">
      <Title className="text-3xl font-bold mb-6">Admin Dashboard</Title>

      {/* Metrics Grid */}
      <Grid numColsSm={2} numColsLg={3} className="gap-6 mb-6">
        {metrics.map((item) => (
          <Card key={item.title} className="bg-gray-800 border-gray-700">
            <Flex alignItems="start">
              <div className="bg-gray-700 p-2 rounded-full">
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <Text className="text-gray-300">{item.title}</Text>
                <Metric className="text-white">{item.value}</Metric>
                <Flex className="mt-2">
                  {item.changeType === "positive" ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  )}
                  <Text className={`ml-1 ${item.changeType === "positive" ? "text-green-500" : "text-red-500"}`}>
                    {item.change}
                  </Text>
                </Flex>
              </div>
            </Flex>
          </Card>
        ))}
      </Grid>

      {/* Sales Data */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <Title className="text-xl font-semibold mb-4">Sales Overview</Title>
        <BarList
          data={salesData}
          valueFormatter={(value) => `$${value}`}
          className="mt-2"
          color="blue"
        />
      </Card>

      {/* Traffic Data */}
      <Card className="bg-gray-800 border-gray-700">
        <Title className="text-xl font-semibold mb-4">Traffic Sources</Title>
        <BarList
          data={trafficData}
          valueFormatter={(value) => `${value} visits`}
          className="mt-2"
          color="green"
        />
      </Card>
    </main>
  );
}