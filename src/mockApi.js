import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { Container, Navbar, Nav, Form, Button, Table, Card } from 'react-bootstrap';

import { getRequests, getRequestById, createRequest, updateRequest, deleteRequest } from './mockApi';

// Navbar component
function Navigation() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">Request Manager</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav>
            <Nav.Link as={Link} to="/">Requests</Nav.Link>
            <Nav.Link as={Link} to="/create">Create Request</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

// Request List page
function RequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    setLoading(true);
    const data = await getRequests();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this request?')) {
      await deleteRequest(id);
      fetchRequests();
    }
  };

  return (
    <Container>
      <h2>Request List</h2>
      {loading ? <p>Loading...</p> : (
        requests.length === 0 ? (
          <p>No requests found.</p>
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>{req.id}</td>
                  <td>{req.title}</td>
                  <td>
                    <Button variant="info" size="sm" onClick={() => navigate(`/details/${req.id}`)}>View</Button>{' '}
                    <Button variant="warning" size="sm" onClick={() => navigate(`/edit/${req.id}`)}>Edit</Button>{' '}
                    <Button variant="danger" size="sm" onClick={() => handleDelete(req.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )
      )}
    </Container>
  );
}

// Request Details page
function RequestDetails() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRequest() {
      setLoading(true);
      const data = await getRequestById(parseInt(id));
      setRequest(data);
      setLoading(false);
    }
    fetchRequest();
  }, [id]);

  if (loading) return <Container><p>Loading...</p></Container>;

  if (!request) {
    return (
      <Container>
        <p>Request not found!</p>
        <Button onClick={() => navigate('/')}>Back to List</Button>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <Card.Header>Request Details - ID: {request.id}</Card.Header>
        <Card.Body>
          <Card.Title>{request.title}</Card.Title>
          <Card.Text>{request.description}</Card.Text>
          <Button variant="secondary" onClick={() => navigate('/')}>Back to List</Button>
        </Card.Body>
      </Card>
    </Container>
  );
}

// Request Form page (for create and edit)
function RequestForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      async function fetchRequest() {
        setLoading(true);
        const reqToEdit = await getRequestById(parseInt(id));
        if (reqToEdit) {
          setTitle(reqToEdit.title);
          setDescription(reqToEdit.description);
        }
        setLoading(false);
      }
      fetchRequest();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim() === '') {
      alert('Title is required');
      return;
    }
    if (isEdit) {
      await updateRequest({ id: parseInt(id), title, description });
    } else {
      await createRequest({ title, description });
    }
    navigate('/');
  };

  if (loading) return <Container><p>Loading...</p></Container>;

  return (
    <Container>
      <h2>{isEdit ? 'Edit Request' : 'Create Request'}</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Enter request title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            placeholder="Enter description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} />
        </Form.Group>

        <Button variant="primary" type="submit">
          {isEdit ? 'Update' : 'Create'}
        </Button>{' '}
        <Button variant="secondary" onClick={() => navigate('/')}>Cancel</Button>
      </Form>
    </Container>
  );
}

// Main App
export default function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<RequestList />} />
        <Route path="/create" element={<RequestForm />} />
        <Route path="/edit/:id" element={<RequestForm />} />
        <Route path="/details/:id" element={<RequestDetails />} />
      </Routes>
    </Router>
  );
}
