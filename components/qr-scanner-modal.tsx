"use client"

import { useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"
import QrScanner from "qr-scanner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CameraIcon, FlipHorizontal, Loader2 } from "lucide-react"

interface DrinkInfo {
  name: string
  caffeine: number
  unit: string
}

// Yleisimpien energiajuomien tietokanta
const DRINK_DATABASE: Record<string, DrinkInfo> = {
  "6415600501781": { name: "Red Bull 250ml", caffeine: 80, unit: "mg" },
  "6415600501996": { name: "Red Bull Sugar Free 250ml", caffeine: 80, unit: "mg" },
  "5060335632302": { name: "Monster Energy 500ml", caffeine: 160, unit: "mg" },
  "5060335632319": { name: "Monster Energy Ultra 500ml", caffeine: 160, unit: "mg" },
  "6420256001827": { name: "ED Energy Drink 250ml", caffeine: 80, unit: "mg" },
  "6420256001834": { name: "ED Sugar Free 250ml", caffeine: 80, unit: "mg" },
  "5060517889852": { name: "Nocco BCAA 330ml", caffeine: 180, unit: "mg" },
  "6420829986033": { name: "Battery 330ml", caffeine: 105, unit: "mg" }
}

interface QRScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onCodeScanned: (data: string) => void
}

export function QRScannerModal({
  isOpen,
  onClose,
  onCodeScanned,
}: QRScannerModalProps) {
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const [permission, setPermission] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const webcamRef = useRef<Webcam | null>(null)
  const scannerRef = useRef<NodeJS.Timeout | null>(null)

  const toggleCamera = () => {
    setFacingMode(current => current === "user" ? "environment" : "user")
  }

  const requestPermission = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      setPermission(true)
    } catch (error) {
      console.error("Camera permission denied:", error)
      setPermission(false)
      setError("Kameran käyttöoikeus evätty")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      requestPermission()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !webcamRef.current || !permission) return

    const scanQRCode = async () => {
      const imageSrc = webcamRef.current?.getScreenshot()
      if (!imageSrc) return

      try {
        const result = await QrScanner.scanImage(imageSrc)
        if (result) {
          // Jos koodi on EAN-muotoinen (13 tai 8 numeroa)
          if (/^\d{8,13}$/.test(result)) {
            // Tarkistetaan löytyykö tuote tietokannasta
            const drink = DRINK_DATABASE[result]
            if (drink) {
              // Jos tuote löytyy, lähetetään se JSON-muodossa
              onCodeScanned(JSON.stringify({
                type: "drink",
                barcode: result,
                ...drink
              }))
              onClose()
              return
            } else {
              // Jos viivakoodi on oikean muotoinen mutta tuotetta ei löydy
              onCodeScanned(JSON.stringify({
                type: "unknown_barcode",
                barcode: result,
                message: "Tuotetta ei löytynyt tietokannasta"
              }))
              onClose()
              return
            }
          }

          // Jos ei ole EAN tai tuotetta ei löydy, lähetetään alkuperäinen data
          onCodeScanned(JSON.stringify({
            type: "other",
            data: result
          }))
          onClose()
        }
      } catch (error) {
        // QR code not found in this frame
      }
    }

    scannerRef.current = setInterval(scanQRCode, 500)

    return () => {
      if (scannerRef.current) {
        clearInterval(scannerRef.current)
      }
    }
  }, [isOpen, permission, onCodeScanned, onClose])

  if (!isOpen) return null

  if (permission === false) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kamera vaaditaan</DialogTitle>
            <DialogDescription>
              {error || "Viivakoodin skannaamiseen tarvitaan kameran käyttöoikeus. Ole hyvä ja salli kameran käyttö selaimen asetuksista."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Sulje
            </Button>
            <Button onClick={requestPermission} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ladataan...
                </>
              ) : (
                "Yritä uudelleen"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Skannaa viivakoodi</DialogTitle>
          <DialogDescription>
            Aseta tuotteen viivakoodi kameran näkymään skannataksesi sen.
          </DialogDescription>
        </DialogHeader>
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode,
              width: 1280,
              height: 720,
            }}
            className="w-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4/5 h-1/3 border-2 border-white/50 rounded-lg relative">
              <div className="absolute inset-0 border-t-2 border-l-2 border-white/50 w-8 h-8 -top-2 -left-2" />
              <div className="absolute inset-0 border-t-2 border-r-2 border-white/50 w-8 h-8 -top-2 -right-2" />
              <div className="absolute inset-0 border-b-2 border-l-2 border-white/50 w-8 h-8 -bottom-2 -left-2" />
              <div className="absolute inset-0 border-b-2 border-r-2 border-white/50 w-8 h-8 -bottom-2 -right-2" />
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={toggleCamera}>
            <FlipHorizontal className="mr-2 h-4 w-4" />
            Vaihda kamera
          </Button>
          <Button variant="outline" onClick={onClose}>
            Sulje
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 