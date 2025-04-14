"use client"

import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function TestQRCodes() {
  // Esimerkkejä erilaisista QR-koodeista
  const testCodes = [
    {
      title: "Kahvi",
      description: "Normaali kahvikuppi",
      data: JSON.stringify({
        type: "drink",
        name: "Coffee",
        caffeine: 95,
        size: "regular",
        unit: "mg"
      })
    },
    {
      title: "Energy Drink",
      description: "Monster Energy 500ml",
      data: JSON.stringify({
        type: "drink",
        name: "Monster Energy",
        caffeine: 160,
        size: "500ml",
        unit: "mg"
      })
    },
    {
      title: "Espresso",
      description: "Tupla espresso",
      data: JSON.stringify({
        type: "drink",
        name: "Double Espresso",
        caffeine: 128,
        size: "double",
        unit: "mg"
      })
    }
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {testCodes.map((code, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{code.title}</CardTitle>
            <CardDescription>{code.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <QRCodeSVG
              value={code.data}
              size={200}
              level="H"
              includeMargin
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 