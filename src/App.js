import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { Container, Navbar, Nav, Form, Button, Table, Card } from 'react-bootstrap';

// Navbar component
function Navigation() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">HOME</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav>
            <Nav.Link as={Link} to="/">Requests</Nav.Link>
            <Nav.Link as={Link} to="/create">Request Form</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link> {/* 👈 Added About link */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

// About page component
function AboutPage() {
  return (
    <Container>
      <Card>
        <Card.Header as="h5">About This System</Card.Header>
        <Card.Body>
          <Card.Text>
            <strong>CARAGA STATE UNIVERSITY - Cabadbaran Campus</strong> aims to digitalize its internal request handling
            and student service system. Currently, various offices such as the <strong>Registrar, IT, Library, and Student Affairs</strong>
            handle student requests manually, causing delays and redundant work.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
}

// Request List page
function RequestList({ requests }) {
  const navigate = useNavigate();

  return (
    <Container>
      <h2>Request List</h2>
      {requests.length === 0 ? (
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
                  <Button variant="warning" size="sm" onClick={() => navigate(`/edit/${req.id}`)}>Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

// Request Details page
function RequestDetails({ requests }) {
  const { id } = useParams();
  const request = requests.find((r) => r.id === parseInt(id));
  const navigate = useNavigate();

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
function RequestForm({ requests, addRequest, updateRequest }) {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isEdit) {
      const reqToEdit = requests.find((r) => r.id === parseInt(id));
      if (reqToEdit) {
        setTitle(reqToEdit.title);
        setDescription(reqToEdit.description);
      }
    }
  }, [id, isEdit, requests]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() === '') {
      alert('Title is required');
      return;
    }
    if (isEdit) {
      updateRequest({ id: parseInt(id), title, description });
    } else {
      addRequest({ title, description });
    }
    navigate('/');
  };

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
  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem('requests');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('requests', JSON.stringify(requests));
  }, [requests]);

  const addRequest = (request) => {
    const newRequest = {
      id: requests.length > 0 ? requests[requests.length - 1].id + 1 : 1,
      ...request
    };
    setRequests([...requests, newRequest]);
  };

  const updateRequest = (updatedRequest) => {
    setRequests(requests.map((r) => (r.id === updatedRequest.id ? updatedRequest : r)));
  };

  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<RequestList requests={requests} />} />
        <Route path="/create" element={<RequestForm addRequest={addRequest} requests={requests} />} />
        <Route path="/edit/:id" element={<RequestForm updateRequest={updateRequest} requests={requests} />} />
        <Route path="/details/:id" element={<RequestDetails requests={requests} />} />
        <Route path="/about" element={<AboutPage />} /> {/* 👈 Route for About */}
      </Routes>
    </Router>
  );
}
