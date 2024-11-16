export enum ThoughtKind {
    Normal = 1,
    Type = 2,
    Event = 3,
    Tag = 4,
    System = 5
}

export enum ThoughtRelation {
    Child = 1,
    Parent = 2,
    Jump = 3,
    Sibling = 4
}

export enum AccessType {
    Public = 0,
    Private = 1
}

export const API_KEY = "e521ea99e1b5b574c3eab5a13208ebe0b929712da46abbcb150df362a5f7faab"
export const BRAIN_ID = "b0f66acd-1357-4175-9ab7-74b620b637d2"
export const API_BASE_URL = "https://api.bra.in"
export const ROOT_THOUGHT_ID = "5af76133-1c66-4136-8a50-9a7810385e92"



export const getBrains = async () => {
    const response = await fetch(`${API_BASE_URL}/brains`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }

    const data = await response.json();
    return data;
}

export const getThoughtDetails = async (thoughtId: string, includeSiblings: boolean = false) => {
    const response = await fetch(
        `${API_BASE_URL}/thoughts/${BRAIN_ID}/${thoughtId}/graph?includeSiblings=${includeSiblings}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }

    const data = await response.json();
    return data;
}

export const getThoughtByExactName = async (nameExact: string) => {
    const response = await fetch(`${API_BASE_URL}/thoughts/${BRAIN_ID}?nameExact=${encodeURIComponent(nameExact)}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    if (response.status === 404) {
        throw new Error("Thought not found");
    }

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }

    const data = await response.json();
    return data;
}

export interface CreateThoughtParams {
    name: string;
    kind: ThoughtKind;
    label?: string;
    typeId?: string;
    sourceThoughtId?: string;
    relation?: ThoughtRelation;
    acType?: AccessType;
}

export const createThought = async (params: CreateThoughtParams) => {

    try {
        const response = await fetch(`${API_BASE_URL}/thoughts/${BRAIN_ID}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: params.name,
                kind: params.kind,
                label: params.label,
                typeId: params.typeId,
                sourceThoughtId: params.sourceThoughtId,
                relation: params.relation,
                acType: params.acType
            }),
        });

        if (!response.ok) {
            throw new Error('Request failed: ' + response.statusText);
        }

        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error('Error: ', error.message);
        throw new Error('An error occurred while creating the thought.');
    }
};


export const getThought = async (thoughtId: string) => {
    const response = await fetch(`${API_BASE_URL}/thoughts/${BRAIN_ID}/${thoughtId}`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }

    const data = await response.json();
    return data;
}

export interface CreateLinkParams {
    thoughtIdA: string;
    thoughtIdB: string;
    relation: ThoughtRelation;
    name?: string;
}

export const createLink = async (params: CreateLinkParams) => {
    try {
        const response = await fetch(`${API_BASE_URL}/links/${BRAIN_ID}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                thoughtIdA: params.thoughtIdA,
                thoughtIdB: params.thoughtIdB,
                relation: params.relation,
                name: params.name
            }),
        });

        if (!response.ok) {
            throw new Error('Request failed: ' + response.statusText);
        }

        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error('Error: ', error.message);
        throw new Error('An error occurred while creating the link.');
    }
};

interface UpdateThoughtColorParams {
  thoughtId: string;
  backgroundColor: string;
}

export const updateThoughtColor = async ({ thoughtId, backgroundColor }: UpdateThoughtColorParams) => {
  try {
    const response = await fetch(`${API_BASE_URL}/thoughts/${BRAIN_ID}/${thoughtId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json-patch+json',
      },
      body: JSON.stringify([
        {
          value: backgroundColor,
          operationType: 2,
          path: "/backgroundColor",
          op: "replace"
        }
      ]),
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorText = await response.text();
        if (errorText) {
          errorMessage = errorText;
        }
      } catch (e) {
        // If we can't parse the error message, use the status text
      }
      throw new Error(`Request failed: ${errorMessage}`);
    }

    // Only try to parse JSON if we have content
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    return data;
  } catch (error: any) {
    console.error('Error: ', error.message);
    throw error; // Re-throw the error to be handled by the caller
  }
};


