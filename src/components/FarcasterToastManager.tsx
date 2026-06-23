'use client'

import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { useManifestStatus } from '@/hooks/useManifestStatus'

interface ManifestResult {
  header: string
  payload: string
  signature: string
}

interface FarcasterToastManagerProps {
  children: (handlers: {
    onManifestSuccess: (result: ManifestResult) => void
    onManifestError: (errorMessage: string, errorType: string) => void
  }) => React.ReactNode
}

export default function FarcasterToastManager({ children }: FarcasterToastManagerProps): JSX.Element {
  const { isSigned, isLoading, refetch } = useManifestStatus()
  const copyAllAsJSON = async (result: ManifestResult): Promise<void> => {
    try {
      const jsonData = {
        accountAssociation: {
          header: result.header,
          payload: result.payload,
          signature: result.signature
        }
      }
      const instruction = 'Add this json object to the public/.well-known/farcaster.json file now under the accountAssociation object while keeping the frame object as it is there:\n\n'
      const textToCopy = instruction + JSON.stringify(jsonData, null, 2)
      await navigator.clipboard.writeText(textToCopy)
      toast.success('Account Association JSON copied to clipboard! 📋', {
        duration: 2000,
      })
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      toast.error('Failed to copy to clipboard', {
        duration: 2000,
      })
    }
  }

  const handleManifestSuccess = (result: ManifestResult): void => {
    // Refresh the manifest status after successful signing
    refetch()
    
    // Only show toast if manifest wasn't already signed
    if (isSigned && !isLoading) {
      console.log('Manifest was already signed, skipping success toast')
      return
    }
    
    toast.success('Manifest Signed Successfully! 🎉', {
      description: `Domain: captured-garden-516.app.ohara.ai`,
      duration: 5000,
      action: {
        label: 'View Details',
        onClick: () => {
          toast.info('Manifest Details', {
            description: (
              <div className="text-xs font-mono space-y-3 text-black">
                <div>
                  <strong className="text-black">Header:</strong>
                  <div className="bg-gray-100 p-2 rounded text-black mt-1">
                    {result.header}
                  </div>
                </div>
                
                <div>
                  <strong className="text-black">Payload:</strong>
                  <div className="bg-gray-100 p-2 rounded text-black mt-1">
                    {result.payload}
                  </div>
                </div>
                
                <div>
                  <strong className="text-black">Signature:</strong>
                  <div className="bg-gray-100 p-2 rounded text-black mt-1">
                    {result.signature}
                  </div>
                </div>
                
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => copyAllAsJSON(result)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                  >
                    📋 Copy All as JSON
                  </button>
                </div>
                
                <div className="text-xs text-gray-600 mt-2 text-center">
                  💡 Click button above to copy as accountAssociation JSON object
                </div>
              </div>
            ),
            duration: 12000,
          })
        },
      },
    })
  }

  const handleManifestError = (errorMessage: string, errorType: string): void => {
    // Only show error toast if manifest wasn't already signed
    if (isSigned && !isLoading) {
      console.log('Manifest was already signed, skipping error toast')
      return
    }
    
    toast.error('Manifest Signing Failed', {
      description: errorType.toUpperCase() + ': ' + errorMessage,
      duration: 6000,
    })
  }

  return (
    <>
      <Toaster />
      {children({
        onManifestSuccess: handleManifestSuccess,
        onManifestError: handleManifestError,
      })}
    </>
  )
}

export type { ManifestResult }
