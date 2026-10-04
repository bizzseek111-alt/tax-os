/**
 * Autonomous Tax OS — Canonical Tax Graph Architecture
 * Workstream 2: Unified Tax & Evidence Graph with 100% Provenance Traversal.
 */

export type TaxNodeType = 
  | 'DOCUMENT' 
  | 'TRANSACTION' 
  | 'FACT' 
  | 'TAX_POSITION' 
  | 'FORM_LINE';

export type TaxEdgeRelation = 
  | 'EVIDENCE_FOR' 
  | 'STATUTORY_BASIS' 
  | 'AGGREGATED_INTO' 
  | 'MODIFIED_BY';

export interface TaxGraphNode {
  id: string;
  type: TaxNodeType;
  label: string;
  amountCents?: number;
  metadata: {
    sourceHash?: string;
    formLine?: string;
    statutoryCitation?: string;
    taxYear: number;
    jurisdiction: string;
    verifiedAt?: string;
    [key: string]: any;
  };
}

export interface TaxGraphEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  relation: TaxEdgeRelation;
  description: string;
}

export interface ProvenancePath {
  formLineNode: TaxGraphNode;
  positions: TaxGraphNode[];
  statutes: string[];
  transactions: TaxGraphNode[];
  documents: TaxGraphNode[];
  totalAmountCents: number;
}

export class CanonicalTaxGraph {
  private nodes: Map<string, TaxGraphNode> = new Map();
  private edges: Map<string, TaxGraphEdge> = new Map();

  public addNode(node: TaxGraphNode): void {
    this.nodes.set(node.id, node);
  }

  public getNode(id: string): TaxGraphNode | undefined {
    return this.nodes.get(id);
  }

  public addEdge(edge: TaxGraphEdge): void {
    this.edges.set(edge.id, edge);
  }

  /**
   * Traverses backward from any Form Line Node to retrieve its complete Provenance DAG.
   */
  public traceProvenance(formLineNodeId: string): ProvenancePath {
    const formLineNode = this.nodes.get(formLineNodeId);
    if (!formLineNode) {
      throw new Error(`Node ${formLineNodeId} not found in Tax Graph.`);
    }

    const positions: TaxGraphNode[] = [];
    const statutes: string[] = [];
    const transactions: TaxGraphNode[] = [];
    const documents: TaxGraphNode[] = [];

    // Find all edges pointing TO this form line
    const incomingToForm = Array.from(this.edges.values()).filter(
      e => e.toNodeId === formLineNodeId && e.relation === 'AGGREGATED_INTO'
    );

    for (const edge of incomingToForm) {
      const positionNode = this.nodes.get(edge.fromNodeId);
      if (positionNode && positionNode.type === 'TAX_POSITION') {
        positions.push(positionNode);
        if (positionNode.metadata.statutoryCitation) {
          statutes.push(positionNode.metadata.statutoryCitation);
        }

        // Trace transactions supporting this position
        const incomingToPos = Array.from(this.edges.values()).filter(
          e => e.toNodeId === positionNode.id && e.relation === 'EVIDENCE_FOR'
        );

        for (const posEdge of incomingToPos) {
          const txNode = this.nodes.get(posEdge.fromNodeId);
          if (txNode && txNode.type === 'TRANSACTION') {
            transactions.push(txNode);

            // Trace document supporting this transaction
            const incomingToTx = Array.from(this.edges.values()).filter(
              e => e.toNodeId === txNode.id && e.relation === 'EVIDENCE_FOR'
            );

            for (const txEdge of incomingToTx) {
              const docNode = this.nodes.get(txEdge.fromNodeId);
              if (docNode && docNode.type === 'DOCUMENT') {
                documents.push(docNode);
              }
            }
          }
        }
      }
    }

    const totalAmountCents = formLineNode.amountCents || positions.reduce((sum, p) => sum + (p.amountCents || 0), 0);

    return {
      formLineNode,
      positions,
      statutes: Array.from(new Set(statutes)),
      transactions,
      documents,
      totalAmountCents
    };
  }

  public getAllNodes(): TaxGraphNode[] {
    return Array.from(this.nodes.values());
  }

  public getAllEdges(): TaxGraphEdge[] {
    return Array.from(this.edges.values());
  }
}
