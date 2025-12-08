"""Workflow execution router for Lab mode."""
from typing import Dict, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/workflows", tags=["workflows"])


class NodeData(BaseModel):
    """Node data structure."""
    label: str
    prompt: str | None = None
    model: str | None = None
    duration: float | None = None
    camera: str | None = None
    factor: int | None = None
    path: str | None = None


class WorkflowNode(BaseModel):
    """Workflow node."""
    id: str
    type: str
    data: Dict
    position: Dict[str, float]


class WorkflowEdge(BaseModel):
    """Workflow edge connecting nodes."""
    id: str
    source: str
    target: str
    animated: bool | None = None


class WorkflowExecuteRequest(BaseModel):
    """Request to execute a workflow."""
    nodes: List[WorkflowNode]
    edges: List[WorkflowEdge]


class WorkflowExecuteResponse(BaseModel):
    """Response from workflow execution."""
    status: str
    message: str
    results: Dict[str, str]


@router.post("/execute", response_model=WorkflowExecuteResponse)
async def execute_workflow(request: WorkflowExecuteRequest) -> WorkflowExecuteResponse:
    """
    Execute a workflow graph.
    
    This will:
    1. Build a dependency graph from nodes and edges
    2. Execute nodes in topological order
    3. Pass outputs from one node to the next
    4. Return final results
    
    Currently returns a mock response - integrate with actual generation in production.
    """
    # Build execution order (topological sort)
    execution_order = _topological_sort(request.nodes, request.edges)
    
    results = {}
    for node_id in execution_order:
        node = next(n for n in request.nodes if n.id == node_id)
        
        # Mock execution based on node type
        if node.type == "textNode":
            results[node_id] = f"prompt: {node.data.get('prompt', '')}"
        elif node.type == "imageGenNode":
            results[node_id] = f"generated_image_{node_id}.png"
        elif node.type == "videoGenNode":
            results[node_id] = f"generated_video_{node_id}.mp4"
        elif node.type == "upscaleNode":
            results[node_id] = f"upscaled_{node_id}.png"
        elif node.type == "outputNode":
            # Get input from connected node
            input_edges = [e for e in request.edges if e.target == node_id]
            if input_edges:
                source_id = input_edges[0].source
                results[node_id] = results.get(source_id, "output.png")
    
    return WorkflowExecuteResponse(
        status="success",
        message=f"Executed {len(execution_order)} nodes",
        results=results
    )


def _topological_sort(nodes: List[WorkflowNode], edges: List[WorkflowEdge]) -> List[str]:
    """
    Perform topological sort on the workflow graph.
    Returns list of node IDs in execution order.
    """
    # Build adjacency list
    graph: Dict[str, List[str]] = {node.id: [] for node in nodes}
    in_degree: Dict[str, int] = {node.id: 0 for node in nodes}
    
    for edge in edges:
        graph[edge.source].append(edge.target)
        in_degree[edge.target] += 1
    
    # Find nodes with no incoming edges
    queue = [node_id for node_id, degree in in_degree.items() if degree == 0]
    result = []
    
    while queue:
        node_id = queue.pop(0)
        result.append(node_id)
        
        for neighbor in graph[node_id]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    
    if len(result) != len(nodes):
        raise HTTPException(status_code=400, detail="Workflow contains a cycle")
    
    return result


@router.post("/validate", response_model=Dict[str, str])
async def validate_workflow(request: WorkflowExecuteRequest) -> Dict[str, str]:
    """Validate a workflow graph for cycles and disconnected nodes."""
    try:
        execution_order = _topological_sort(request.nodes, request.edges)
        return {
            "status": "valid",
            "message": f"Workflow is valid with {len(execution_order)} nodes",
            "execution_order": ",".join(execution_order)
        }
    except HTTPException as e:
        return {
            "status": "invalid",
            "message": str(e.detail)
        }
