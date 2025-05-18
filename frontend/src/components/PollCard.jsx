import { Card, CardContent, Typography, Button, Box, LinearProgress, Chip } from '@mui/material';
import { HowToVote, Poll } from '@mui/icons-material';

const PollCard = ({ poll, onVote }) => {
  const options = JSON.parse(poll.options);
  const totalVotes = options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleVote = () => {
    if (selectedOption !== null) {
      onVote(poll.id, options[selectedOption].text);
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Poll color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">{poll.question}</Typography>
          {!poll.is_active && <Chip label="Closed" size="small" sx={{ ml: 1 }} />}
        </Box>
        
        {options.map((option, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">
                {option.text}
              </Typography>
              {totalVotes > 0 && (
                <Typography variant="body2">
                  {Math.round((option.votes / totalVotes) * 100)}%
                </Typography>
              )}
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        ))}
        
        {poll.is_active && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Select your vote:</Typography>
            {options.map((option, index) => (
              <Button
                key={index}
                variant={selectedOption === index ? "contained" : "outlined"}
                size="small"
                sx={{ mr: 1, mb: 1 }}
                onClick={() => setSelectedOption(index)}
              >
                {option.text}
              </Button>
            ))}
            <Button
              variant="contained"
              startIcon={<HowToVote />}
              disabled={selectedOption === null}
              onClick={handleVote}
              sx={{ mt: 1 }}
            >
              Vote
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PollCard;