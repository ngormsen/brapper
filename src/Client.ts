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
    // Fetch the current thought to check if 'backgroundColor' exists
    const thoughtResponse = await fetch(`${API_BASE_URL}/thoughts/${BRAIN_ID}/${thoughtId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!thoughtResponse.ok) {
      throw new Error('Failed to fetch thought: ' + thoughtResponse.statusText);
    }

    const thoughtData = await thoughtResponse.json();
    const propertyExists = thoughtData.backgroundColor !== undefined && thoughtData.backgroundColor !== null;

    // Set operationType and op based on existence of 'backgroundColor'
    const operationType = propertyExists ? 2 : 0; // 2 = replace, 0 = add
    const op = propertyExists ? 'replace' : 'add';

    // Proceed to update the backgroundColor
    const response = await fetch(`${API_BASE_URL}/thoughts/${BRAIN_ID}/${thoughtId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json-patch+json',
      },
      body: JSON.stringify([
        {
          value: backgroundColor,
          operationType: operationType,
          path: "/backgroundColor",
          op: op
        }
      ]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response: ', errorText);
      throw new Error('Request failed: ' + response.statusText);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error: ', error.message);
    throw new Error('An error occurred while updating the thought color.');
  }
};


