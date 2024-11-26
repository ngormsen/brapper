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


export interface Link {
    id: string;
    brainId: string;
    creationDateTime: string;
    modificationDateTime: string;
    name: string | null;
    cleanedUpName: string | null;
    typeId: string | null;
    kind: number;
    color: string | null;
    thickness: number | null;
    thoughtIdA: string;
    thoughtIdB: string;
    relation: number;
    direction: number;
    meaning: number;
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
    try {
        const response = await fetch(
            `${API_BASE_URL}/thoughts/${BRAIN_ID}/${thoughtId}/graph?includeSiblings=${includeSiblings}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error('Request failed: ' + response.statusText);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error instanceof Error && error.message.includes('Request failed')) {
            throw error;
        }
        console.warn('Failed to fetch thought details:', thoughtId);
        return null;
    }
};

export const getThoughtByExactName = async (nameExact: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/thoughts/${BRAIN_ID}?nameExact=${encodeURIComponent(nameExact)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error('Request failed: ' + response.statusText);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error instanceof Error && error.message.includes('Request failed')) {
            throw error;
        }
        throw new Error('Failed to check for existing thought');
    }
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
    try {
        const response = await fetch(`${API_BASE_URL}/thoughts/${BRAIN_ID}/${thoughtId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error('Request failed: ' + response.statusText);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error instanceof Error && error.message.includes('Request failed')) {
            throw error;
        }
        // For network or other errors
        console.warn('Failed to fetch thought:', thoughtId);
        return null;
    }
};

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

export async function deleteThought(thoughtId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/thoughts/${BRAIN_ID}/${thoughtId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Failed to delete thought');
    }
}

export const getLinkBetweenNodes = async (thoughtIdA: string, thoughtIdB: string): Promise<Link | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/links/${BRAIN_ID}/${thoughtIdA}/${thoughtIdB}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return null; // Link not found
    }

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data as Link; // Returns the link object with proper typing
  } catch (error: any) {
    console.error('Error fetching link:', error.message);
    throw new Error('Failed to fetch link between nodes.');
  }
};

export const removeLink = async (linkId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/links/${BRAIN_ID}/${linkId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }
  } catch (error: any) {
    console.error('Error deleting link:', error.message);
    throw new Error('Failed to delete link.');
  }
};

export interface SearchResult {
  sourceThought: {
    id: string;
    brainId: string;
    creationDateTime: string;
    modificationDateTime: string;
    name: string;
    cleanedUpName: string;
    typeId: string;
    acType: number;
    kind: number;
    backgroundColor: string;
  };
  searchResultType: number;
  isFromOtherBrain: boolean;
  name: string;
  attachmentId: string;
  brainName: string;
  brainId: string;
  entityType: number;
  sourceType: number;
}

export const searchThoughts = async (
  queryText: string,
  maxResults: number = 1,
  onlySearchThoughtNames: boolean = true
): Promise<SearchResult[]> => {
  try {
    const url = new URL(`${API_BASE_URL}/search/${BRAIN_ID}`);
    url.searchParams.append('queryText', queryText);
    url.searchParams.append('maxResults', maxResults.toString());
    url.searchParams.append('onlySearchThoughtNames', onlySearchThoughtNames.toString());

    const response = await fetch(url.toString(), {
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
  } catch (error: any) {
    console.error('Error fetching search results:', error.message);
    throw new Error('Failed to fetch search results.');
  }
};

// Notes API Methods
export interface NotesDto {
    content: string;
}

export const getNoteMarkdown = async (thoughtId: string): Promise<NotesDto> => {
    const response = await fetch(`${API_BASE_URL}/notes/${BRAIN_ID}/${thoughtId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }

    return response.json();
};

export const getNoteHtml = async (thoughtId: string): Promise<NotesDto> => {
    const response = await fetch(`${API_BASE_URL}/notes/${BRAIN_ID}/${thoughtId}/html`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }

    return response.json();
};

export const getNoteText = async (thoughtId: string): Promise<NotesDto> => {
    const response = await fetch(`${API_BASE_URL}/notes/${BRAIN_ID}/${thoughtId}/text`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }

    return response.json();
};

export interface NotesUpdateModel {
    content: string;
}

export const createOrUpdateNote = async (thoughtId: string, content: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/notes/${BRAIN_ID}/${thoughtId}/update`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }
};

export const appendToNote = async (thoughtId: string, content: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/notes/${BRAIN_ID}/${thoughtId}/append`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }
};

// Attachments API Methods
export interface AttachmentDto {
    id: string;
    brainId: string;
    creationDateTime: string;
    modificationDateTime: string;
    name: string;
    location: string;
    size: number;
    contentType: string;
}

export const getAttachmentDetails = async (attachmentId: string): Promise<AttachmentDto> => {
    const response = await fetch(`${API_BASE_URL}/attachments/${BRAIN_ID}/${attachmentId}/metadata`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }

    return response.json();
};

export const getAttachmentContent = async (attachmentId: string): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/attachments/${BRAIN_ID}/${attachmentId}/file-content`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
        },
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }

    return response.blob();
};

export const deleteAttachment = async (attachmentId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/attachments/${BRAIN_ID}/${attachmentId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
        },
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }
};

export const addFileAttachment = async (thoughtId: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/attachments/${BRAIN_ID}/${thoughtId}/file`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }
};

export const addUrlAttachment = async (thoughtId: string, url: string, name?: string): Promise<void> => {
    const queryParams = new URLSearchParams({ url });
    if (name) {
        queryParams.append('name', name);
    }

    const response = await fetch(`${API_BASE_URL}/attachments/${BRAIN_ID}/${thoughtId}/url?${queryParams}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
        },
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }
};

// Brain Access API Methods
export interface BrainAccessorDto {
    accessorId: string;
    name: string;
    isOrganizationUser: boolean;
    isPending: boolean;
    accessType: number;
}

export const getBrainAccessors = async (): Promise<BrainAccessorDto[]> => {
    const response = await fetch(`${API_BASE_URL}/brain-access/${BRAIN_ID}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }

    return response.json();
};

export interface SetBrainAccessParams {
    emailAddress?: string;
    userId?: string;
    accessType: number;
}

export const setBrainAccessLevel = async (params: SetBrainAccessParams): Promise<void> => {
    const queryParams = new URLSearchParams();
    if (params.emailAddress) {
        queryParams.append('emailAddress', params.emailAddress);
    }
    if (params.userId) {
        queryParams.append('userId', params.userId);
    }
    queryParams.append('accessType', params.accessType.toString());

    const response = await fetch(`${API_BASE_URL}/brain-access/${BRAIN_ID}?${queryParams}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
        },
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }
};

export interface RemoveBrainAccessParams {
    emailAddress?: string;
    userId?: string;
}

export const removeBrainAccess = async (params: RemoveBrainAccessParams): Promise<void> => {
    const queryParams = new URLSearchParams();
    if (params.emailAddress) {
        queryParams.append('emailAddress', params.emailAddress);
    }
    if (params.userId) {
        queryParams.append('userId', params.userId);
    }

    const response = await fetch(`${API_BASE_URL}/brain-access/${BRAIN_ID}?${queryParams}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
        },
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }
};

// Search API Methods
export interface SearchResultDto {
    thoughtId: string;
    brainId: string;
    name: string;
    score: number;
    kind: number;
}

export interface SearchParams {
    queryText: string;
    maxResults?: number;
    onlySearchThoughtNames?: boolean;
}

export const searchBrain = async (params: SearchParams): Promise<SearchResultDto[]> => {
    const queryParams = new URLSearchParams({
        queryText: params.queryText,
        maxResults: (params.maxResults || 30).toString(),
    });
    
    if (params.onlySearchThoughtNames !== undefined) {
        queryParams.append('onlySearchThoughtNames', params.onlySearchThoughtNames.toString());
    }

    const response = await fetch(`${API_BASE_URL}/search/${BRAIN_ID}?${queryParams}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }

    return response.json();
};

export interface SearchPublicParams extends SearchParams {
    excludeBrainIds?: string[];
}

export const searchPublicBrains = async (params: SearchPublicParams): Promise<SearchResultDto[]> => {
    const queryParams = new URLSearchParams({
        queryText: params.queryText,
        maxResults: (params.maxResults || 30).toString(),
    });
    
    if (params.onlySearchThoughtNames !== undefined) {
        queryParams.append('onlySearchThoughtNames', params.onlySearchThoughtNames.toString());
    }
    
    if (params.excludeBrainIds) {
        params.excludeBrainIds.forEach(id => queryParams.append('excludeBrainIds', id));
    }

    const response = await fetch(`${API_BASE_URL}/search/public?${queryParams}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }

    return response.json();
};

export const searchAccessibleBrains = async (params: SearchParams): Promise<SearchResultDto[]> => {
    const queryParams = new URLSearchParams({
        queryText: params.queryText,
        maxResults: (params.maxResults || 30).toString(),
    });
    
    if (params.onlySearchThoughtNames !== undefined) {
        queryParams.append('onlySearchThoughtNames', params.onlySearchThoughtNames.toString());
    }

    const response = await fetch(`${API_BASE_URL}/search/accessible?${queryParams}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }

    return response.json();
};

// Statistics API Methods
export interface StatisticsDto {
    thoughtsCount: number;
    linksCount: number;
    attachmentsCount: number;
    internalFilesSize: number;
    iconsFilesSize: number;
}

export const getBrainStats = async (): Promise<StatisticsDto> => {
    const response = await fetch(`${API_BASE_URL}/brains/${BRAIN_ID}/statistics`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }

    return response.json();
};

// Thought Types API Methods
export const getTypes = async (): Promise<ThoughtDto[]> => {
    const response = await fetch(`${API_BASE_URL}/thoughts/${BRAIN_ID}/types`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }

    return response.json();
};

// Thought Pinning API Methods
export const pinThought = async (thoughtId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/thoughts/${BRAIN_ID}/${thoughtId}/pin`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
        },
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }
};

export const unpinThought = async (thoughtId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/thoughts/${BRAIN_ID}/${thoughtId}/pin`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
        },
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }
};

export const getPinnedThoughts = async (): Promise<ThoughtDto[]> => {
    const response = await fetch(`${API_BASE_URL}/thoughts/${BRAIN_ID}/pins`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }

    return response.json();
};

// Modification Logs API Methods
export interface ModificationLogDto {
    id: string;
    brainId: string;
    modType: number;
    sourceId: string;
    sourceType: number;
    extraAId: string | null;
    extraAType: number;
    extraBId: string | null;
    extraBType: number;
    modificationDateTime: string;
}

export interface GetModificationsParams {
    maxLogs: number;
    startTime?: string;
    endTime?: string;
}

export const getBrainModifications = async (params: GetModificationsParams): Promise<ModificationLogDto[]> => {
    const queryParams = new URLSearchParams({
        maxLogs: params.maxLogs.toString(),
    });
    
    if (params.startTime) {
        queryParams.append('startTime', params.startTime);
    }
    if (params.endTime) {
        queryParams.append('endTime', params.endTime);
    }

    const response = await fetch(`${API_BASE_URL}/brains/${BRAIN_ID}/modifications?${queryParams}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }

    return response.json();
};

export interface GetThoughtModificationsParams {
    maxLogs: number;
    includeRelatedLogs: boolean;
}

export const getThoughtModifications = async (thoughtId: string, params: GetThoughtModificationsParams): Promise<ModificationLogDto[]> => {
    const queryParams = new URLSearchParams({
        maxLogs: params.maxLogs.toString(),
        includeRelatedLogs: params.includeRelatedLogs.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/thoughts/${BRAIN_ID}/${thoughtId}/modifications?${queryParams}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Request failed: ' + response.statusText);
    }

    return response.json();
};

export interface ThoughtDto {
    id: string;
    brainId: string;
    typeId: string | null;
    creationDateTime: string;
    modificationDateTime: string;
    forgottenDateTime: string | null;
    linksModificationDateTime: string;
    name: string;
    label: string | null;
    foregroundColor: string | null;
    backgroundColor: string | null;
    acType: number;
    kind: number;
}
