import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | EnergyRacer",
  description: "Privacy Policy for EnergyRacer application",
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose prose-sm max-w-none">
        <h2 className="text-xl font-semibold mt-6 mb-4">1. General</h2>
        <p>
          This Privacy Policy describes how EnergyRacer application ("we", "Service") collects, processes, 
          and protects your personal data. We comply with the EU General Data Protection Regulation (GDPR) 
          and other applicable data protection legislation.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">2. Collected Data</h2>
        <p>
          We collect the following information:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Username</li>
          <li>Location (city)</li>
          <li>Caffeine consumption data</li>
          <li>Achievements and statistics</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-4">3. Purpose of Data Processing</h2>
        <p>
          We use the data for the following purposes:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Providing and maintaining the Service</li>
          <li>User account management</li>
          <li>Creating statistics and leaderboards</li>
          <li>Service development</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-4">4. Data Sharing</h2>
        <p>
          We do not share your personal data with third parties without your consent, except when required 
          by law. Publicly visible information includes username, location, and leaderboard data.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">5. Data Protection</h2>
        <p>
          We protect your data with appropriate technical and organizational measures. We use encrypted 
          connections and secure databases for data storage.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">6. User Rights</h2>
        <p>
          You have the right to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Access your collected data</li>
          <li>Request correction or deletion of data</li>
          <li>Object to data processing</li>
          <li>Request data portability</li>
        </ul>

        <div className="mt-8 text-sm text-gray-600">
          <p>Last updated: April 15, 2024</p>
        </div>
      </div>
    </div>
  )
} 