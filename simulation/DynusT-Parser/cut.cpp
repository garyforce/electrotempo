#include <boost/algorithm/string.hpp>
#include <string>

using namespace std;
using namespace boost;

string cut(string &line, int start, int length)
{
  string text = line.substr(start, length);
  trim(text);
  return text;
}
