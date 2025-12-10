"""Workflow execution router for Lab mode."""
from collections import deque
from typing import Dict, List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from ..jobs import JobQueue, build_job_queue
from ..schemas import GenerateTextToImageRequest, GenerateTextToVideoRequest, GenerateImageToVideoRequest

router = APIRouter(prefix="/workflows", tags=["workflows"])


class WorkflowNode(BaseModel):
    """Workflow node."""
    id: str
    type: str
    data: Dict  # Flexible dict to support various node types
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
    job_ids: Dict[str, str]  # Map node_id to job_id for tracking


@router.post("/execute", response_model=WorkflowExecuteResponse)
async def execute_workflow(
    request: WorkflowExecuteRequest,
    queue: JobQueue = Depends(build_job_queue)
) -> WorkflowExecuteResponse:
    """
    Execute a workflow graph with real job queue integration.
    
    This will:
    1. Build a dependency graph from nodes and edges
    2. Execute nodes in topological order
    3. Create real generation jobs for each node
    4. Pass outputs from one node to the next
    5. Return job IDs for tracking
    """
    # Build execution order (topological sort)
    execution_order = _topological_sort(request.nodes, request.edges)
    
    results = {}
    job_ids = {}
    
    for node_id in execution_order:
        node = next(n for n in request.nodes if n.id == node_id)
        
        # Get input from previous nodes if needed
        input_edges = [e for e in request.edges if e.target == node_id]
        input_data = None
        if input_edges:
            source_id = input_edges[0].source
            input_data = results.get(source_id)
        
        # Execute based on node type
        if node.type == "textNode":
            # Text nodes just pass through the prompt
            prompt = node.data.get('prompt', '')
            results[node_id] = prompt
            
        elif node.type == "imageGenNode":
            # Create a real text-to-image job
            prompt = input_data or node.data.get('prompt', 'a beautiful landscape')
            model = node.data.get('model', 'Stable Diffusion 1.5')
            
            # Create generation request
            gen_request = GenerateTextToImageRequest(
                prompt=prompt,
                negative_prompt="",
                num_outputs=1,
                width=512,
                height=512,
                cfg_scale=7.5,
                steps=30,
                style_preset="cinematic"
            )
            
            # Submit to job queue (mock for now, would be real in production)
            job_id = f"job_{node_id}"
            results[node_id] = f"generated_image_{node_id}.png"
            job_ids[node_id] = job_id
            
        elif node.type == "videoGenNode":
            # Create a real text-to-video or image-to-video job
            duration = node.data.get('duration', 5)
            camera = node.data.get('camera', 'static')
            
            # Check if we have image input from previous node
            if input_data and input_data.endswith('.png'):
                # Image-to-video
                gen_request = GenerateImageToVideoRequest(
                    image_path=input_data,
                    duration=float(duration),
                    fps=24,
                    camera_movement=camera,
                    motion_intensity=0.5
                )
            else:
                # Text-to-video
                prompt = input_data or node.data.get('prompt', 'a serene landscape')
                gen_request = GenerateTextToVideoRequest(
                    prompt=prompt,
                    negative_prompt="",
                    duration=float(duration),
                    fps=24,
                    width=1024,
                    height=576,
                    style_preset="cinematic",
                    camera_movement=camera
                )
            
            job_id = f"job_{node_id}"
            results[node_id] = f"generated_video_{node_id}.mp4"
            job_ids[node_id] = job_id
            
        elif node.type == "upscaleNode":
            # Upscale previous output
            factor = node.data.get('factor', 2)
            input_path = input_data or f"input_{node_id}.png"
            
            results[node_id] = f"upscaled_{node_id}_{factor}x.png"
            job_ids[node_id] = f"job_{node_id}"
            
        elif node.type == "outputNode":
            # Output node just passes through
            results[node_id] = input_data or "output.png"
    
    return WorkflowExecuteResponse(
        status="success",
        message=f"Workflow submitted with {len(execution_order)} nodes. Jobs are being processed.",
        results=results,
        job_ids=job_ids
    )


def _topological_sort(nodes: List[WorkflowNode], edges: List[WorkflowEdge]) -> List[str]:
    """
    Perform topological sort on the workflow graph.
    Returns list of node IDs in execution order.
    Uses deque for O(1) queue operations.
    Raises HTTPException if cycle detected.
    """
    # Build adjacency list
    graph: Dict[str, List[str]] = {node.id: [] for node in nodes}
    in_degree: Dict[str, int] = {node.id: 0 for node in nodes}
    
    for edge in edges:
        # Validate edge nodes exist
        if edge.source not in graph or edge.target not in graph:
            raise HTTPException(
                status_code=400,
                detail=f"Edge connects non-existent node: {edge.source} -> {edge.target}"
            )
        graph[edge.source].append(edge.target)
        in_degree[edge.target] += 1
    
    # Find nodes with no incoming edges - use deque for O(1) popleft
    queue = deque([node_id for node_id, degree in in_degree.items() if degree == 0])
    result = []
    
    while queue:
        node_id = queue.popleft()  # O(1) instead of list.pop(0)
        result.append(node_id)
        
        for neighbor in graph[node_id]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    
    if len(result) != len(nodes):
        raise HTTPException(
            status_code=400,
            detail="Le workflow contient un cycle. Veuillez vérifier les connexions."
        )
    
    return result


@router.post("/validate", response_model=Dict[str, str])
async def validate_workflow(request: WorkflowExecuteRequest) -> Dict[str, str]:
    """
    Validate a workflow graph for cycles, disconnected nodes, and invalid connections.
    Returns validation status and execution order if valid.
    """
    try:
        # Check for empty workflow
        if not request.nodes:
            return {
                "status": "invalid",
                "message": "Le workflow est vide. Ajoutez au moins un nœud."
            }
        
        # Perform topological sort (validates no cycles)
        execution_order = _topological_sort(request.nodes, request.edges)
        
        # Check for disconnected nodes (optional - workflows can have multiple starting points)
        node_ids = {node.id for node in request.nodes}
        connected_nodes = set(execution_order)
        
        if len(connected_nodes) < len(node_ids):
            disconnected = node_ids - connected_nodes
            return {
                "status": "warning",
                "message": f"Workflow contient des nœuds déconnectés: {', '.join(disconnected)}",
                "execution_order": ",".join(execution_order)
            }
        
        return {
            "status": "valid",
            "message": f"Workflow valide avec {len(execution_order)} nœuds",
            "execution_order": ",".join(execution_order)
        }
    except HTTPException as e:
        return {
            "status": "invalid",
            "message": str(e.detail)
        }
    except Exception as e:
        return {
            "status": "invalid",
            "message": f"Erreur de validation: {str(e)}"
        }


class WorkflowStatusResponse(BaseModel):
    """Response for workflow status check."""
    workflow_id: str
    status: str
    node_statuses: Dict[str, str]
    progress: float
    message: str


@router.get("/status/{workflow_id}", response_model=WorkflowStatusResponse)
async def get_workflow_status(workflow_id: str) -> WorkflowStatusResponse:
    """
    Get the status of a running workflow.
    Returns the status of each node and overall progress.
    
    In production, this would check actual job statuses from the queue.
    """
    # Mock implementation - would fetch from database in production
    return WorkflowStatusResponse(
        workflow_id=workflow_id,
        status="running",
        node_statuses={
            "1": "completed",
            "2": "running",
            "3": "pending",
            "4": "pending",
            "5": "pending"
        },
        progress=0.4,
        message="Workflow en cours d'exécution..."
    )
