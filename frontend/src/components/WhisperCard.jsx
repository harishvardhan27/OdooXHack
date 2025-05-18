import { Card, CardContent, Typography, Box, Chip, IconButton } from '@mui/material';
import { LocationOn, MoreVert } from '@mui/icons-material';

const WhisperCard = ({ whisper, isAdmin, onModerate }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleApprove = () => {
    onModerate(whisper.id, true);
    handleMenuClose();
  };

  const handleReject = () => {
    onModerate(whisper.id, false);
    handleMenuClose();
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {whisper.text}
          </Typography>
          {isAdmin && (
            <div>
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleApprove}>Approve</MenuItem>
                <MenuItem onClick={handleReject}>Reject</MenuItem>
              </Menu>
            </div>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="caption" color="text.secondary">
            {whisper.location}
          </Typography>
          {!whisper.is_approved && (
            <Chip label="Pending" size="small" color="warning" sx={{ ml: 1 }} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default WhisperCard;