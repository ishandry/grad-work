export interface KeyTermsRequest {
  lecture_text: string
}

export interface KeyTermsResponse {
  key_terms: string
}

export class KeyTermsApiClient {
  private baseUrl = "http://3.72.95.128:8000"

  async extractKeyTerms(lectureText: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/extract-key-terms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lecture_text: lectureText }),
    })

    if (!response.ok) {
      throw new Error(`Key terms extraction API error: ${response.status}`)
    }

    const data: KeyTermsResponse = await response.json()

    // Split by commas and trim whitespace
    return data.key_terms
      .split(",")
      .map((term) => term.trim())
      .filter((term) => term.length > 0)
  }
}

export const keyTermsApiClient = new KeyTermsApiClient()
