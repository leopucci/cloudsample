import 'package:flutter/material.dart';
import 'package:modulo2/quiz.dart';
import 'package:modulo2/result.dart';

void main() {
  runApp(MyApp());
}

//void main() => runApp(MyApp());

class MyApp extends StatefulWidget {
  @override
  State<StatefulWidget> createState() {
    // TODO: implement createState
    return _MyAppState();
  }
}

class _MyAppState extends State<MyApp> {
  final _questions = [
    {
      'questionText': 'Qual sua cor favorita',
      'answers': [
        {'text': 'Black', 'score': 10},
        {'text': 'Red', 'score': 5},
        {'text': 'Green', 'score': 3},
        {'text': 'Blue', 'score': 1},
      ],
    },
    {
      'questionText': 'Qual seu animal favorito',
      'answers': [
        {'text': 'Leao', 'score': 10},
        {'text': 'Ovelha', 'score': 3},
        {'text': 'carneiro', 'score': 2},
        {'text': 'Vacuxa', 'score': 7},
      ],
    },
    {
      'questionText': 'Quem e seu instrutor favorito',
      'answers': [
        {'text': 'Max', 'score': 10},
        {'text': 'Whatever', 'score': 3},
        {'text': 'Sei La', 'score': 2},
        {'text': 'Balnka', 'score': 7},
      ],
    }
  ];

  int _questionsIndex = 0;
  int _totalScore = 0;
  void _answerQuestion(int score) {
    if (_questionsIndex < _questions.length) {
      print('We have more questions!');
    } else {
      print('We DONT have more questions!');
    }
    _totalScore = _totalScore + score;

    setState(() {
      _questionsIndex = _questionsIndex + 1;
    });

    print(_questionsIndex);
  }

  void _resetQuiz() {
    setState(() {
      this._questionsIndex = 0;
      this._totalScore = 0;
    });
    print("Valores resetados!");
  }

  @override
  Widget build(BuildContext ctx) {
    return MaterialApp(
      home: Scaffold(
        drawer: Drawer(
          // Add a ListView to the drawer. This ensures the user can scroll
          // through the options in the drawer if there isn't enough vertical
          // space to fit everything.
          child: ListView(
            // Important: Remove any padding from the ListView.
            padding: EdgeInsets.zero,
            children: <Widget>[
              DrawerHeader(
                child: Text('Drawer Header'),
                decoration: BoxDecoration(
                  color: Colors.blue,
                ),
              ),
              ListTile(
                title: Text('Item 1'),
                onTap: () {
                  // Update the state of the app.
                  // ...
                },
              ),
              ListTile(
                title: Text('Item 2'),
                onTap: () {
                  // Update the state of the app.
                  // ...
                },
              ),
            ],
          ),
        ),
        appBar: AppBar(
          title: Text('TITULO'),
        ),
        body: _questionsIndex < _questions.length
            ? Quiz(
                answerQuestion: _answerQuestion,
                questionsIndex: _questionsIndex,
                questions: _questions,
              )
            : Result(_totalScore, _resetQuiz),
      ),
    );
  }
}
